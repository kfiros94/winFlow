package com.winflow.winflow.repository;

import com.winflow.winflow.entity.SportMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Finds PENDING matches whose start time is already in the past (needs resolution)
    List<SportMatch> findByStatusAndStartTimeBefore(SportMatch.MatchStatus status, LocalDateTime time);

    // Returns all distinct league names ever synced for a given sport
    @Query("SELECT DISTINCT m.leagueName FROM SportMatch m WHERE m.sportType = :sportType AND m.leagueName IS NOT NULL ORDER BY m.leagueName")
    List<String> findDistinctLeagueNamesBySportType(@Param("sportType") SportMatch.SportType sportType);
}
