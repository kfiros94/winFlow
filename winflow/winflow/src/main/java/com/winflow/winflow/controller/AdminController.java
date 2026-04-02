package com.winflow.winflow.controller;

import com.winflow.winflow.service.GuessService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final GuessService guessService;

    public AdminController(GuessService guessService) {
        this.guessService = guessService;
    }

    /**
     * Admin Endpoint to end a match and trigger the payouts.
     * Example URL: POST http://localhost:8080/api/admin/resolve/1?homeScore=110&awayScore=95
     */
    @PostMapping("/resolve/{matchId}")
    public String resolveMatch(@PathVariable Long matchId, @RequestParam Integer homeScore, @RequestParam Integer awayScore) {
        guessService.resolveMatchAndPayWinners(matchId, homeScore, awayScore);
        return "Match " + matchId + " officially resolved! Payouts have been distributed to all winning wallets.";
    }
}