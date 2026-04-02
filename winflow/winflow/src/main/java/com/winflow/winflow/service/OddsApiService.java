package com.winflow.winflow.service;

import com.winflow.winflow.dto.MatchOddsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;

@Service
public class OddsApiService {

    private static final Logger log = LoggerFactory.getLogger(OddsApiService.class);

    private final WebClient webClient;
    private final String apiKey;

    public OddsApiService(WebClient oddsWebClient, @Value("${odds.api.key}") String apiKey) {
        this.webClient = oddsWebClient;
        this.apiKey = apiKey;
    }

    /**
     * Fetches odds for any sport key supported by The Odds API.
     * e.g. "basketball_nba", "soccer_epl", "soccer_spain_la_liga"
     */
    public List<MatchOddsDTO> fetchOdds(String sportKey) {
        log.info("Fetching odds for sport: {}", sportKey);
        try {
            List<MatchOddsDTO> result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(sportKey + "/odds/")
                            .queryParam("apiKey", apiKey.trim())
                            .queryParam("regions", "us")
                            .queryParam("markets", "h2h")
                            .build())
                    .retrieve()
                    .bodyToFlux(MatchOddsDTO.class)
                    .collectList()
                    .block();

            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("FAILED to fetch odds for '{}': {} — {}", sportKey, e.getClass().getSimpleName(), e.getMessage());
            return Collections.emptyList();
        }
    }
}
