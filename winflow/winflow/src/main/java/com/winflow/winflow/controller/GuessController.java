package com.winflow.winflow.controller;

import com.winflow.winflow.dto.GuessRequest;
import com.winflow.winflow.entity.Guess;
import com.winflow.winflow.service.GuessService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guesses")
public class GuessController {

    private final GuessService guessService;

    public GuessController(GuessService guessService) {
        this.guessService = guessService;
    }

    @PostMapping("/place")
    public Guess placeBet(@RequestBody GuessRequest request) {
        return guessService.placeGuess(request);
    }
}
