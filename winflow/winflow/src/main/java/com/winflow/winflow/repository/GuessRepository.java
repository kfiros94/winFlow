package com.winflow.winflow.repository;

import com.winflow.winflow.entity.Guess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuessRepository extends JpaRepository<Guess, Long>{
    // Automatically generates SQL to find all guesses made by a specific user ID
    List<Guess> findByUserId(Long userId);

    // Automatically generates SQL to find all guesses for a specific match
    List<Guess> findBySportMatchId(Long matchId);
}
