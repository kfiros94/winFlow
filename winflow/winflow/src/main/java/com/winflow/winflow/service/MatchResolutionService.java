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
        // ── [1] PROOF THE SCHEDULER IS ALIVE ──────────────────────────────────
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("[AUTO-RESOLVE] ▶ Scheduled task fired at: " + LocalDateTime.now());
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // ── [2] HOW MANY PAST-PENDING MATCHES ARE IN THE DB? ─────────────────
        List<SportMatch> pastPending = matchRepository.findByStatusAndStartTimeBefore(
                SportMatch.MatchStatus.PENDING, LocalDateTime.now()
        );
        System.out.println("[AUTO-RESOLVE] Past PENDING matches found in DB: " + pastPending.size());

        if (pastPending.isEmpty()) {
            System.out.println("[AUTO-RESOLVE] Nothing to resolve. Exiting.");
            return;
        }

        for (SportMatch m : pastPending) {
            System.out.printf("[AUTO-RESOLVE]   DB match → id=%d | externalApiId=%s | %s vs %s | startTime=%s%n",
                    m.getId(), m.getExternalApiId(), m.getHomeTeam(), m.getAwayTeam(), m.getStartTime());
        }

        // Build a fast lookup by externalApiId
        Map<String, SportMatch> pendingById = pastPending.stream()
                .collect(Collectors.toMap(SportMatch::getExternalApiId, m -> m));

        // ── [3] FETCH SCORES PER SPORT KEY ────────────────────────────────────
        for (String sportKey : sportMatchService.getAllSportKeys()) {
            System.out.println("\n[AUTO-RESOLVE] Fetching scores for sportKey: " + sportKey);
            List<ScoreDTO> scores = oddsApiService.fetchScores(sportKey);
            System.out.println("[AUTO-RESOLVE]   API returned " + scores.size() + " score entries for " + sportKey);

            for (ScoreDTO score : scores) {
                System.out.printf("[AUTO-RESOLVE]   Score entry → id=%s | completed=%s | %s vs %s | scores=%s%n",
                        score.id(), score.completed(), score.homeTeam(), score.awayTeam(), score.scores());

                // ── [4] ID MATCHING ───────────────────────────────────────────
                boolean idInDb = pendingById.containsKey(score.id());
                if (!idInDb) {
                    System.out.println("[AUTO-RESOLVE]     ↳ SKIPPED — id not in our pending DB matches");
                    continue;
                }

                if (!Boolean.TRUE.equals(score.completed())) {
                    System.out.println("[AUTO-RESOLVE]     ↳ SKIPPED — completed=false (match not finished yet)");
                    continue;
                }

                SportMatch match = pendingById.get(score.id());

                if (score.scores() == null || score.scores().isEmpty()) {
                    System.out.println("[AUTO-RESOLVE]     ↳ SKIPPED — scores list is null/empty from API");
                    continue;
                }

                System.out.println("[AUTO-RESOLVE]     ↳ MATCH FOUND — attempting to parse scores...");
                System.out.println("[AUTO-RESOLVE]       DB homeTeam  : '" + match.getHomeTeam() + "'");
                System.out.println("[AUTO-RESOLVE]       DB awayTeam  : '" + match.getAwayTeam() + "'");

                // Parse home and away scores by team name
                Integer homeScore = null;
                Integer awayScore = null;
                for (ScoreDTO.ScoreEntry entry : score.scores()) {
                    System.out.printf("[AUTO-RESOLVE]       API score entry → name='%s' score='%s'%n",
                            entry.name(), entry.score());
                    try {
                        int val = Integer.parseInt(entry.score().trim());
                        if (entry.name().equalsIgnoreCase(match.getHomeTeam())) {
                            homeScore = val;
                            System.out.println("[AUTO-RESOLVE]         ✔ Matched as HOME score: " + val);
                        } else if (entry.name().equalsIgnoreCase(match.getAwayTeam())) {
                            awayScore = val;
                            System.out.println("[AUTO-RESOLVE]         ✔ Matched as AWAY score: " + val);
                        } else {
                            System.out.printf("[AUTO-RESOLVE]         ✘ No match — API name '%s' != '%s' or '%s'%n",
                                    entry.name(), match.getHomeTeam(), match.getAwayTeam());
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("[AUTO-RESOLVE]         ✘ Could not parse score value: '" + entry.score() + "'");
                    }
                }

                if (homeScore == null || awayScore == null) {
                    System.out.printf("[AUTO-RESOLVE]     ↳ SKIPPED — could not map both scores (home=%s, away=%s). Team name mismatch?%n",
                            homeScore, awayScore);
                    continue;
                }

                try {
                    guessService.resolveMatchAndPayWinners(match.getId(), homeScore, awayScore);
                    System.out.printf("[AUTO-RESOLVE]     ✅ RESOLVED: %s %d-%d %s%n",
                            match.getHomeTeam(), homeScore, awayScore, match.getAwayTeam());
                } catch (Exception e) {
                    System.out.println("[AUTO-RESOLVE]     ❌ FAILED to resolve match id=" + match.getId() + ": " + e.getMessage());
                }
            }
        }

        System.out.println("\n[AUTO-RESOLVE] ◀ Done at: " + LocalDateTime.now());
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
}
