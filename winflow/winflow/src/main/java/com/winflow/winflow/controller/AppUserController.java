package com.winflow.winflow.controller;

import com.winflow.winflow.entity.AppUser;
import com.winflow.winflow.service.AppUserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private final AppUserService userService;

    public AppUserController(AppUserService userService) {
        this.userService = userService;
    }

    /**
     * Listens for POST requests to create a new user
     * Example URL: POST http://localhost:8080/api/users/register?username=kfir&email=kfir@test.com
     */
    @PostMapping("/register")
    public AppUser registerUser(@RequestParam String username, @RequestParam String email) {
        return userService.createNewUser(username, email);
    }

    /**
     * Fetches a user's profile and current coin balance!
     * Example URL: GET http://localhost:8080/api/users/1
     */
    @GetMapping("/{id}")
    public AppUser getUserProfile(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}