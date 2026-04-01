package com.winflow.winflow.service;

import com.winflow.winflow.entity.AppUser;
import com.winflow.winflow.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AppUserService {

    private final AppUserRepository userRepository;

    // Standard Constructor Injection
    public AppUserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Creates a new user and gives them 1,000 starting coins
     */
    public AppUser createNewUser(String username, String email) {
        // 1. Check if the username is already taken
        Optional<AppUser> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }

        // 2. Build the new user using standard Java
        AppUser newUser = new AppUser();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setCoinBalance(1000.0); // Welcome bonus!

        // 3. Save to database and return
        return userRepository.save(newUser);
    }

    /**
     * Finds a user by their ID
     */
    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }
}