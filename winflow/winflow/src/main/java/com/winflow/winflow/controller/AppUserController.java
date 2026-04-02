package com.winflow.winflow.controller;

import com.winflow.winflow.dto.LoginRequest;
import com.winflow.winflow.dto.RegisterRequest;
import com.winflow.winflow.entity.AppUser;
import com.winflow.winflow.service.AppUserService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private final AppUserService userService;

    public AppUserController(AppUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public AppUser registerUser(@RequestBody RegisterRequest request) {
        AppUser user = userService.createNewUser(request.username(), request.email(), request.password());
        user.setPassword(null); // Never send the password back to the client
        return user;
    }

    @PostMapping("/login")
    public AppUser loginUser(@RequestBody LoginRequest request) {
        AppUser user = userService.login(request.username(), request.password());
        user.setPassword(null); // Never send the password back to the client
        return user;
    }

    @GetMapping("/{id}")
    public AppUser getUserProfile(@PathVariable Long id) {
        AppUser user = userService.getUserById(id);
        user.setPassword(null);
        return user;
    }
}
