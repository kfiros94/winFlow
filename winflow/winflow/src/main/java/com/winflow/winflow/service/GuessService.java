package com.winflow.winflow.service;

import com.winflow.winflow.dto.GuessRequest;
import com.winflow.winflow.entity.AppUser;
import com.winflow.winflow.entity.Guess;
import com.winflow.winflow.entity.SportMatch;
import com.winflow.winflow.repository.AppUserRepository;
import com.winflow.winflow.repository.GuessRepository;
import com.winflow.winflow.repository.SportMatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class GuessService {
    private final GuessRepository guessRepository;
    private final AppUserRepository userRepository;
    private final SportMatchRepository matchRepository;

    public GuessService(GuessRepository guessRepository, AppUserRepository userRepository, SportMatchRepository matchRepository) {
        this.guessRepository = guessRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
    }

    /**
     * @Transactional It tells Spring: "If any part of this method fails or crashes,
     * instantly undo everything (rollback) so the user doesn't lose their coins by accident!"
     */
    @Transactional
    public Guess placeGuess(GuessRequest request) {
        //1. Find the user
        AppUser user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        // 2. Find the Match
        SportMatch match = matchRepository.findById(request.matchId())
                .orElseThrow(() -> new RuntimeException("Match not found!"));
        //3. Rule Check: Is the match still open for betting?
        if (match.getStatus() != SportMatch.MatchStatus.PENDING) {
            throw new RuntimeException("This match has already started or finished!");
        }
        //4. Rule check: Does the user have enough coins?
        if (user.getCoinBalance() < request.coinAmount()) {
            throw new RuntimeException("Insufficient coins! You only have: " + user.getCoinBalance());
        }

        //5. Deduct the coins from the user's wallet
        user.setCoinBalance(user.getCoinBalance() - request.coinAmount());
        userRepository.save(user); // Save the updated wallet

        // 6. Create and save the Guess (bypassing Lombok builder)
        Guess newGuess = new Guess();
        newGuess.setUser(user);
        newGuess.setSportMatch(match);
        newGuess.setCoinAmount(request.coinAmount());
        newGuess.setPredictionOutcome(request.prediction());
        newGuess.setStatus(Guess.GuessStatus.PENDING);
        newGuess.setGuessTime(LocalDateTime.now());

        return guessRepository.save(newGuess);

    }
}
