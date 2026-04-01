package com.winflow.winflow.service;

import com.winflow.winflow.dto.MatchOddsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class OddsApiService {

    private static final Logger log = LoggerFactory.getLogger(OddsApiService.class);

    private final WebClient webClient;
    private final String apiKey;

    // We inject the WebClient we built in the config, and the API key from our properties file
    public OddsApiService(WebClient oddsWebClient, @Value("${odds.api.key}") String apiKey) {
        this.webClient = oddsWebClient;
        this.apiKey = apiKey;
    }

    /**
     * Reaches out to the internet to grab live NBA games and betting odds
     */
    public List<MatchOddsDTO> fetchLiveNBAOdds() {
        log.info("Fetching live NBA matches from The Odds API...");

        // This sends a GET request to: https://api.the-odds-api.com/v4/sports/basketball_nba/odds/...
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("basketball_nba/odds/")
                        .queryParam("apiKey", apiKey)
                        .queryParam("regions", "us") // We use US bookmakers (like DraftKings) for odds
                        .queryParam("markets", "h2h") // Head-to-Head (Home vs Away)
                        .build())
                .retrieve()
                .bodyToFlux(MatchOddsDTO.class) // Convert the JSON array into a list of our Java Records!
                .collectList()
                .block(); // Wait for the network call to finish
    }
}