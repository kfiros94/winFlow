package com.winflow.winflow.dto;

import java.time.LocalDateTime;

public record BetResponse(
        Long id,
        LocalDateTime guessTime,
        Integer coinAmount,
        String predictionOutcome,
        String status,
        Double rewardAmount,
        String homeTeam,
        String awayTeam,
        String leagueName,
        LocalDateTime matchStartTime,
        Double odds
) {}
