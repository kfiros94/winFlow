package com.winflow.winflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.ZonedDateTime;
import java.util.List;

//Using a Java 'record' automatically creates an immutable DTO for us
public record MatchOddsDTO(
        String id,
        @JsonProperty("sport_key") String sportKey,
        @JsonProperty("commence_time") ZonedDateTime commenceTime,
        @JsonProperty("home_team") String homeTeam,
        @JsonProperty("away_team") String awayTeam,
        List<BookmakerDTO> bookmakers
) {
    public record BookmakerDTO(String key, List<MarketDTO> markets) {}
    public record MarketDTO(String key, List<OutcomeDTO> outcomes) {}
    public record OutcomeDTO(String name, Double price) {}



}
