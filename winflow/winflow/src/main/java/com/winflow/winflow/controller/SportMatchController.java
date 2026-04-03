package com.winflow.winflow.controller;

import com.winflow.winflow.entity.SportMatch;
import com.winflow.winflow.service.SportMatchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController // Tells Spring: "This class listens for internet traffic and replies with JSON"
@RequestMapping("/api/matches") // The base URL for everything in this class
public class SportMatchController {
    private final SportMatchService matchService;

    // Standard Java Constructor to inject the service we built earlier
    public SportMatchController(SportMatchService matchService) {
        this.matchService = matchService;
    }

    /**
     * When a browser goes to http://localhost:8080/api/matches, this method fires!
     */
    @GetMapping
    public List<SportMatch> getAllAvailableMatches() {
        return matchService.getAvailableMatches();
    }

    @GetMapping("/leagues")
    public List<String> getLeagues(@RequestParam String sport) {
        return matchService.getLeaguesBySport(SportMatch.SportType.valueOf(sport.toUpperCase()));
    }
}
