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
import java.util.Set;

@Service
public class SportMatchService {

    private static final Logger log = LoggerFactory.getLogger(SportMatchService.class);

    // All leagues to sync on startup — add or remove entries here freely.
    // The sport keys below come from The Odds API supported sports list.
    private static final List<LeagueConfig> LEAGUES = List.of(
        new LeagueConfig("basketball_nba",                         "NBA",                            SportMatch.SportType.NBA),

        // International / continental competitions
        new LeagueConfig("soccer_uefa_champs_league",              "UEFA Champions League",          SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_uefa_europa_league",              "UEFA Europa League",             SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_uefa_europa_conference_league",   "UEFA Europa Conference League",  SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_uefa_nations_league",             "UEFA Nations League",            SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_fifa_world_cup",                  "FIFA World Cup",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_conmebol_copa_libertadores",      "Copa Libertadores",              SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_conmebol_copa_sudamericana",      "Copa Sudamericana",              SportMatch.SportType.SOCCER),

        // Top European domestic leagues
        new LeagueConfig("soccer_epl",                             "Premier League",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_efl_champ",                       "Championship",                   SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_england_league1",                 "League One",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_england_league2",                 "League Two",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_spain_la_liga",                   "La Liga",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_spain_segunda_division",          "La Liga 2",                      SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_italy_serie_a",                   "Serie A",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_italy_serie_b",                   "Serie B",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_france_ligue_one",                "Ligue 1",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_france_ligue_two",                "Ligue 2",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_germany_bundesliga",              "Bundesliga",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_germany_bundesliga2",             "2. Bundesliga",                  SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_germany_liga3",                   "3. Liga",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_netherlands_eredivisie",          "Eredivisie",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_portugal_primeira_liga",          "Primeira Liga",                  SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_spl",                             "Scottish Premiership",           SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_belgium_first_div",               "Belgian First Division A",       SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_turkey_super_league",             "Super Lig",                      SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_greece_super_league",             "Super League Greece",            SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_austria_bundesliga",              "Austrian Bundesliga",            SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_switzerland_superleague",         "Swiss Super League",             SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_poland_ekstraklasa",              "Polish Ekstraklasa",             SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_finland_veikkausliiga",           "Finnish Veikkausliiga",          SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_league_of_ireland",               "League of Ireland",              SportMatch.SportType.SOCCER),

        // Americas and Asia-Pacific
        new LeagueConfig("soccer_brazil_campeonato",               "Brazil Série A",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_brazil_serie_b",                  "Brazil Série B",                 SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_argentina_primera_division",      "Primera División",               SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_chile_campeonato",                "Chilean Primera División",       SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_mexico_ligamx",                   "Liga MX",                        SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_usa_mls",                         "MLS",                            SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_saudi_arabia_pro_league",         "Saudi Pro League",               SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_japan_j_league",                  "J1 League",                      SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_korea_kleague1",                  "K League 1",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_china_superleague",               "Chinese Super League",           SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_australia_aleague",               "A-League Men",                   SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_sweden_allsvenskan",              "Allsvenskan",                    SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_sweden_superettan",               "Superettan",                     SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_norway_eliteserien",              "Eliteserien",                    SportMatch.SportType.SOCCER),
        new LeagueConfig("soccer_denmark_superliga",               "Superliga",                      SportMatch.SportType.SOCCER)
    );

    // Keep startup/login fast: only these high-value leagues are synced automatically
    // and exposed in the selector for now.
    private static final Set<String> MAIN_LEAGUE_NAMES = Set.of(
        "NBA",
        "UEFA Champions League",
        "UEFA Europa League",
        "Premier League",
        "La Liga",
        "Serie A",
        "Bundesliga",
        "Ligue 1",
        "MLS"
    );

    private final SportMatchRepository matchRepository;
    private final OddsApiService oddsApiService;
    private final TheSportsDbService theSportsDbService;

    public SportMatchService(SportMatchRepository matchRepository,
                             OddsApiService oddsApiService,
                             TheSportsDbService theSportsDbService) {
        this.matchRepository = matchRepository;
        this.oddsApiService = oddsApiService;
        this.theSportsDbService = theSportsDbService;
    }

    public List<String> getLeaguesBySport(SportMatch.SportType sportType) {
        return LEAGUES.stream()
                .filter(league -> league.sportType() == sportType)
                .filter(league -> MAIN_LEAGUE_NAMES.contains(league.leagueName()))
                .map(LeagueConfig::leagueName)
                .distinct()
                .sorted()
                .toList();
    }

    public List<SportMatch> getAvailableMatches() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveDaysAhead = now.plusDays(5);
        return matchRepository.findByStatusAndStartTimeBetweenOrderByStartTimeAsc(
                SportMatch.MatchStatus.PENDING, now, fiveDaysAhead
        );
    }

    /**
     * Returns PENDING matches for a specific league within the next 5 days.
     */
    public List<SportMatch> getAvailableMatchesForLeague(String leagueName) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveDaysAhead = now.plusDays(5);
        return matchRepository.findByLeagueNameAndStatusAndStartTimeBetween(
                leagueName, SportMatch.MatchStatus.PENDING, now, fiveDaysAhead
        );
    }

    /**
     * Returns PENDING matches for several selected leagues within the next 5 days.
     */
    public List<SportMatch> getAvailableMatchesForLeagues(List<String> leagueNames) {
        List<String> cleanedLeagueNames = leagueNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        if (cleanedLeagueNames.isEmpty()) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveDaysAhead = now.plusDays(5);
        return matchRepository.findByLeagueNameInAndStatusAndStartTimeBetween(
                cleanedLeagueNames, SportMatch.MatchStatus.PENDING, now, fiveDaysAhead
        );
    }

    /**
     * Runs on startup — syncs only the main leagues so login/cold-start stays fast.
     */
    @PostConstruct
    public void syncMatchesOnStartup() {
        log.info("=== WINFLOW: SYNCING MAIN LEAGUES ===");

        for (LeagueConfig league : LEAGUES.stream().filter(l -> MAIN_LEAGUE_NAMES.contains(l.leagueName())).toList()) {
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

                // Enrich with team logos from TheSportsDB (safe — falls back to default on error)
                newMatch.setHomeTeamLogo(theSportsDbService.fetchTeamLogo(dto.homeTeam()));
                newMatch.setAwayTeamLogo(theSportsDbService.fetchTeamLogo(dto.awayTeam()));

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

    public List<String> getAllSportKeys() {
        return LEAGUES.stream()
                .filter(league -> MAIN_LEAGUE_NAMES.contains(league.leagueName()))
                .map(LeagueConfig::sportKey)
                .toList();
    }

    // Config record — package-accessible so MatchResolutionService can read sport keys
    record LeagueConfig(String sportKey, String leagueName, SportMatch.SportType sportType) {}
}
