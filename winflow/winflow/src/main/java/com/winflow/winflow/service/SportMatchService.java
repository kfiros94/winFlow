package com.winflow.winflow.service;

import com.winflow.winflow.dto.MatchOddsDTO;
import com.winflow.winflow.entity.SportMatch;
import com.winflow.winflow.repository.SportMatchRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class SportMatchService {

    private static final Logger log = LoggerFactory.getLogger(SportMatchService.class);

    private final SportMatchRepository matchRepository;
    private final OddsApiService oddsApiService;

    // We updated the constructor to include our new OddsApiService
    public SportMatchService(SportMatchRepository matchRepository, OddsApiService oddsApiService) {
        this.matchRepository = matchRepository;
        this.oddsApiService = oddsApiService;
    }

    public List<SportMatch> getAvailableMatches() {
        return matchRepository.findByStatus(SportMatch.MatchStatus.PENDING);
    }

    /**
     * This method runs automatically when you hit the green "Play" button in IntelliJ!
     */
    @PostConstruct
    public void syncMatchesOnStartup() {
        log.info("--- WINFLOW SYSTEM STARTING: FETCHING LIVE NBA GAMES ---");

        List<MatchOddsDTO> liveMatches = oddsApiService.fetchLiveNBAOdds();

        if (liveMatches == null || liveMatches.isEmpty()) {
            log.warn("No matches found from the API!");
            return;
        }

        for (MatchOddsDTO dto : liveMatches) {
            // 1. Check if we already saved this exact match
            if (matchRepository.findByExternalApiId(dto.id()).isPresent()) {
                continue;
            }

            // 2. Safely dig into the JSON structure to find the betting odds
            Double homeOdds = 1.0;
            Double awayOdds = 1.0;

            if (dto.bookmakers() != null && !dto.bookmakers().isEmpty()) {
                var market = dto.bookmakers().get(0).markets().get(0);
                for (var outcome : market.outcomes()) {
                    if (outcome.name().equals(dto.homeTeam())) {
                        homeOdds = outcome.price();
                    } else if (outcome.name().equals(dto.awayTeam())) {
                        awayOdds = outcome.price();
                    }
                }
            }

            // 3. Convert API Time to Local Database Time
            LocalDateTime matchTime = dto.commenceTime().withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();

            // 4. Build our Entity using the Builder pattern!
            // 4. Build our Entity using standard Java Setters!
            SportMatch newMatch = new SportMatch();
            newMatch.setExternalApiId(dto.id());
            newMatch.setSportType(SportMatch.SportType.NBA);
            newMatch.setHomeTeam(dto.homeTeam());
            newMatch.setAwayTeam(dto.awayTeam());
            newMatch.setStartTime(matchTime);
            newMatch.setHomeWinOdds(homeOdds);
            newMatch.setAwayWinOdds(awayOdds);
            newMatch.setDrawOdds(null); // Basketball rarely has draws
            newMatch.setStatus(SportMatch.MatchStatus.PENDING);

            // 5. Save to the database!
            matchRepository.save(newMatch);
            log.info("Saved Match: {} vs {} (Odds: Home {} | Away {})",
                    newMatch.getHomeTeam(), newMatch.getAwayTeam(), homeOdds, awayOdds);
        }

        log.info("--- SYNC COMPLETE ---");
    }
}