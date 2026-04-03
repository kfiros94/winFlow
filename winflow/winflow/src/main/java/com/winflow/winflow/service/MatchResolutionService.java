package com.winflow.winflow.service;

import com.winflow.winflow.dto.ScoreDTO;
import com.winflow.winflow.entity.SportMatch;
import com.winflow.winflow.repository.SportMatchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MatchResolutionService {

    private static final Logger log = LoggerFactory.getLogger(MatchResolutionService.class);

    private final SportMatchRepository matchRepository;
    private final OddsApiService oddsApiService;
    private final GuessService guessService;
    private final SportMatchService sportMatchService;

    public MatchResolutionService(SportMatchRepository matchRepository,
                                  OddsApiService oddsApiService,
                                  GuessService guessService,
                                  SportMatchService sportMatchService) {
        this.matchRepository = matchRepository;
        this.oddsApiService = oddsApiService;
        this.guessService = guessService;
        this.sportMatchService = sportMatchService;
    }

    /**
     * Runs every 30 minutes. Checks all PENDING matches whose start time has passed,
     * fetches their scores from the Odds API, and resolves + pays out winners automatically.
     */
    @Scheduled(fixedRate = 30 * 60 * 1000)
    public void autoResolveFinishedMatches() {
        List<SportMatch> pastPending = matchRepository.findByStatusAndStartTimeBefore(
                SportMatch.MatchStatus.PENDING, LocalDateTime.now()
        );

        if (pastPending.isEmpty()) {
            log.debug("Auto-resolve: no pending past matches.");
            return;
        }

        log.info("=== AUTO-RESOLVE: {} past PENDING matches to check ===", pastPending.size());

        // Build a fast lookup by externalApiId
        Map<String, SportMatch> pendingById = pastPending.stream()
                .collect(Collectors.toMap(SportMatch::getExternalApiId, m -> m));

        for (String sportKey : sportMatchService.getAllSportKeys()) {
            List<ScoreDTO> scores = oddsApiService.fetchScores(sportKey);

            for (ScoreDTO score : scores) {
                if (!Boolean.TRUE.equals(score.completed())) continue;

                SportMatch match = pendingById.get(score.id());
                if (match == null || score.scores() == null || score.scores().isEmpty()) continue;

                // Parse home and away scores by team name
                Integer homeScore = null;
                Integer awayScore = null;
                for (ScoreDTO.ScoreEntry entry : score.scores()) {
                    try {
                        int val = Integer.parseInt(entry.score().trim());
                        if (entry.name().equalsIgnoreCase(match.getHomeTeam())) homeScore = val;
                        else if (entry.name().equalsIgnoreCase(match.getAwayTeam())) awayScore = val;
                    } catch (NumberFormatException ignored) {}
                }

                if (homeScore == null || awayScore == null) {
                    log.warn("  Could not parse scores for '{}' vs '{}' (id={})",
                            match.getHomeTeam(), match.getAwayTeam(), score.id());
                    continue;
                }

                try {
                    guessService.resolveMatchAndPayWinners(match.getId(), homeScore, awayScore);
                    log.info("  Resolved: {} {}-{} {}",
                            match.getHomeTeam(), homeScore, awayScore, match.getAwayTeam());
                } catch (Exception e) {
                    log.error("  Failed to resolve match {} (id={}): {}",
                            match.getId(), score.id(), e.getMessage());
                }
            }
        }

        log.info("=== AUTO-RESOLVE COMPLETE ===");
    }
}
