package com.winflow.winflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "guesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- The relational magic happens here ---

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private SportMatch sportMatch;

    //------------------------------------------

    @Column(nullable = false)
    private Integer coinAmount; // how many coins did the user bet

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PredictionType predictionOutcome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GuessStatus status;

    //This will be null while the match is pending, and filled when it finishes
    private Double rewardAmount;

    @Column(nullable = false)
    private LocalDateTime guessTime;  // When did they place this bet?




    public enum PredictionType {
        HOME_WIN, AWAY_WIN, DRAW
    }

    public enum GuessStatus {
        PENDING, WIN, LOSS, REFUNDED
    }

}
