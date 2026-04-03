package com.winflow.winflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScoreDTO(
        String id,
        @JsonProperty("home_team") String homeTeam,
        @JsonProperty("away_team") String awayTeam,
        Boolean completed,
        List<ScoreEntry> scores
) {
    public record ScoreEntry(String name, String score) {}
}
