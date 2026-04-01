package com.winflow.winflow.repository;

import com.winflow.winflow.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long>{

    // Spring Boot reads this method name and automatically
    // writes the SQL: SELECT * FROM users WHERE username = ?
    Optional<AppUser> findByUsername(String username);
}
