package com.winflow.winflow.controller;

import com.winflow.winflow.service.GuessService;
import com.winflow.winflow.service.SportMatchService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final GuessService guessService;
    private final SportMatchService sportMatchService;

    public AdminController(GuessService guessService, SportMatchService sportMatchService) {
        this.guessService = guessService;
        this.sportMatchService = sportMatchService;
    }

    @PostMapping("/resolve/{matchId}")
    public String resolveMatch(@PathVariable Long matchId, @RequestParam Integer homeScore, @RequestParam Integer awayScore) {
        guessService.resolveMatchAndPayWinners(matchId, homeScore, awayScore);
        return "Match " + matchId + " officially resolved! Payouts have been distributed to all winning wallets.";
    }

    /**
     * Manually re-triggers the full league sync. Use this from the browser or api-tests.http.
     * GET http://localhost:8080/api/admin/sync
     */
    @PostMapping("/sync")
    public String syncMatches() {
        sportMatchService.syncMatchesOnStartup();
        return "Sync complete — check IntelliJ logs for details.";
    }
}