package com.winflow.winflow.dto;

import com.winflow.winflow.entity.Guess;

public record GuessRequest(
        Long userId,
        long matchId,
        Integer coinAmount,
        Guess.PredictionType prediction
        ) {}
