package com.winflow.winflow.repository;

import com.winflow.winflow.entity.SportMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SportMatchRepository extends JpaRepository<SportMatch, Long> {

    List<SportMatch> findByStatus(SportMatch.MatchStatus status);

    Optional<SportMatch> findByExternalApiId(String externalApiId);

    // Finds all PENDING matches whose start time falls within a given window
    List<SportMatch> findByStatusAndStartTimeBetweenOrderByStartTimeAsc(
            SportMatch.MatchStatus status,
            LocalDateTime from,
            LocalDateTime to
    );
}
