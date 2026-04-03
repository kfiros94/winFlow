package com.winflow.winflow.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TheSportsDbService {

    private static final Logger log = LoggerFactory.getLogger(TheSportsDbService.class);

    // Returned when a team is not found or the API call fails — a transparent 1×1 PNG
    public static final String DEFAULT_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // In-memory cache — survives for the lifetime of the Spring app
    private final Map<String, String> logoCache = new ConcurrentHashMap<>();

    private final WebClient webClient;

    public TheSportsDbService() {
        this.webClient = WebClient.create("https://www.thesportsdb.com");
    }

    /**
     * Returns the logo URL for a team name.
     * Falls back to DEFAULT_LOGO (transparent pixel) if the team is not found or the API is down.
     * Results are cached in memory so each team is only looked up once per app run.
     */
    public String fetchTeamLogo(String teamName) {
        if (teamName == null || teamName.isBlank()) return DEFAULT_LOGO;

        // Return cached result if available
        if (logoCache.containsKey(teamName)) {
            return logoCache.get(teamName);
        }

        String logo = DEFAULT_LOGO;
        try {
            TeamSearchResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/json/3/searchteams.php")
                            .queryParam("t", teamName)
                            .build())
                    .retrieve()
                    .bodyToMono(TeamSearchResponse.class)
                    .block();

            if (response != null
                    && response.teams() != null
                    && !response.teams().isEmpty()) {
                String badge = response.teams().get(0).strTeamBadge();
                if (badge != null && !badge.isBlank()) {
                    logo = badge;
                    log.info("  Logo found for '{}': {}", teamName, badge);
                } else {
                    log.info("  No badge field for '{}', using default", teamName);
                }
            } else {
                log.info("  No teams found for '{}' in TheSportsDB, using default", teamName);
            }
        } catch (Exception e) {
            log.warn("  TheSportsDB call failed for '{}': {} — using default", teamName, e.getMessage());
        }

        logoCache.put(teamName, logo);
        return logo;
    }

    // ── Response DTOs ────────────────────────────────────────────────────────
    private record TeamSearchResponse(List<TeamDTO> teams) {}
    private record TeamDTO(@JsonProperty("strTeamBadge") String strTeamBadge) {}
}
