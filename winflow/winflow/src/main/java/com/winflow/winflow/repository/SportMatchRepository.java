package com.winflow.winflow.repository;

import com.winflow.winflow.entity.SportMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;

@Repository
public interface SportMatchRepository extends JpaRepository<SportMatch, Long>{
    // Automatically generates SQL to find matches by their status (e.g., PENDING)
    List<SportMatch> findByStatus(SportMatch.MatchStatus status);
    // NEW LINE: This lets us check if a game already exists in our database!
    Optional<SportMatch> findByExternalApiId(String externalApiId);
}
