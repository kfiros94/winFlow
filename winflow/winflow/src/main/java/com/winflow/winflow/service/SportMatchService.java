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

    // All leagues to sync on startup — add or remove entries here freely
    private static final List<LeagueConfig> LEAGUES = List.of(
        new LeagueConfig("basketball_nba",            "NBA",                     SportMatch.SportType.NBA),
        new LeagueConfig("soccer_epl",                "Premier League",          SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_spain_la_liga",      "La Liga",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_italy_serie_a",      "Serie A",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_france_ligue_one",   "Ligue 1",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_germany_bundesliga", "Bundesliga",              SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_israel_premier_league", "Israeli Premier League", SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_uefa_nations_league","UEFA Nations League",     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_fifa_world_cup",     "FIFA World Cup",          SportMatch.SportType.SOCCER)
    );

    private final SportMatchRepository matchRepository;
    private final OddsApiService oddsApiService;

    public SportMatchService(SportMatchRepository matchRepository, OddsApiService oddsApiService) {
        this.matchRepository = matchRepository;
        this.oddsApiService = oddsApiService;
    }

    public List<SportMatch> getAvailableMatches() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveDaysAhead = now.plusDays(5);
        return matchRepository.findByStatusAndStartTimeBetweenOrderByStartTimeAsc(
                SportMatch.MatchStatus.PENDING, now, fiveDaysAhead
        );
    }

    /**
     * Runs on startup — loops through every configured league and syncs live matches.
     */
    @PostConstruct
    public void syncMatchesOnStartup() {
        log.info("=== WINFLOW: SYNCING ALL LEAGUES ===");

        for (LeagueConfig league : LEAGUES) {
            log.info("Syncing: {}", league.leagueName());
            List<MatchOddsDTO> matches = oddsApiService.fetchOdds(league.sportKey());

            if (matches.isEmpty()) {
                log.info("  No matches found for {}", league.leagueName());
                continue;
            }

            for (MatchOddsDTO dto : matches) {
                if (matchRepository.findByExternalApiId(dto.id()).isPresent()) {
                    continue; // Already saved
                }

                Double homeOdds = 1.0;
                Double awayOdds = 1.0;
                Double drawOdds = null;

                if (dto.bookmakers() != null && !dto.bookmakers().isEmpty()) {
                    var market = dto.bookmakers().get(0).markets().get(0);
                    for (var outcome : market.outcomes()) {
                        if (outcome.name().equals(dto.homeTeam())) {
                            homeOdds = outcome.price();
                        } else if (outcome.name().equals(dto.awayTeam())) {
                            awayOdds = outcome.price();
                        } else if (outcome.name().equalsIgnoreCase("Draw")) {
                            drawOdds = outcome.price();
                        }
                    }
                }

                LocalDateTime matchTime = dto.commenceTime()
                        .withZoneSameInstant(ZoneId.systemDefault())
                        .toLocalDateTime();

                SportMatch newMatch = new SportMatch();
                newMatch.setExternalApiId(dto.id());
                newMatch.setSportType(league.sportType());
                newMatch.setLeagueName(league.leagueName());
                newMatch.setHomeTeam(dto.homeTeam());
                newMatch.setAwayTeam(dto.awayTeam());
                newMatch.setStartTime(matchTime);
                newMatch.setHomeWinOdds(homeOdds);
                newMatch.setAwayWinOdds(awayOdds);
                newMatch.setDrawOdds(drawOdds);
                newMatch.setStatus(SportMatch.MatchStatus.PENDING);

                try {
                    matchRepository.save(newMatch);
                    log.info("  Saved: {} vs {} ({})", dto.homeTeam(), dto.awayTeam(), league.leagueName());
                } catch (Exception e) {
                    log.error("  FAILED to save match {} vs {}: {}", dto.homeTeam(), dto.awayTeam(), e.getMessage());
                }
            }
        }

        log.info("=== SYNC COMPLETE ===");
    }

    // Simple config record used only in this class
    private record LeagueConfig(String sportKey, String leagueName, SportMatch.SportType sportType) {}
}
