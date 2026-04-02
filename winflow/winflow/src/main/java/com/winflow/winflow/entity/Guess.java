package com.winflow.winflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guesses")
public class Guess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private SportMatch sportMatch;

    @Column(nullable = false)
    private Integer coinAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PredictionType predictionOutcome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GuessStatus status;

    private Double rewardAmount;

    @Column(nullable = false)
    private LocalDateTime guessTime;

    public enum PredictionType {
        HOME_WIN, AWAY_WIN, DRAW
    }

    public enum GuessStatus {
        PENDING, WIN, LOSS, REFUNDED
    }

    // --- STANDARD JAVA CONSTRUCTORS ---
    public Guess() {}

    // --- STANDARD JAVA GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public SportMatch getSportMatch() { return sportMatch; }
    public void setSportMatch(SportMatch sportMatch) { this.sportMatch = sportMatch; }

    public Integer getCoinAmount() { return coinAmount; }
    public void setCoinAmount(Integer coinAmount) { this.coinAmount = coinAmount; }

    public PredictionType getPredictionOutcome() { return predictionOutcome; }
    public void setPredictionOutcome(PredictionType predictionOutcome) { this.predictionOutcome = predictionOutcome; }

    public GuessStatus getStatus() { return status; }
    public void setStatus(GuessStatus status) { this.status = status; }

    public Double getRewardAmount() { return rewardAmount; }
    public void setRewardAmount(Double rewardAmount) { this.rewardAmount = rewardAmount; }

    public LocalDateTime getGuessTime() { return guessTime; }
    public void setGuessTime(LocalDateTime guessTime) { this.guessTime = guessTime; }
}