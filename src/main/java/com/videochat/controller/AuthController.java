package com.videochat.controller;

import com.videochat.model.User;
import com.videochat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.info("Attempting to register user: {}", user.getUsername());
        
        if (userService.existsByUsername(user.getUsername())) {
            logger.warn("Registration failed - username already exists: {}", user.getUsername());
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        if (userService.existsByEmail(user.getEmail())) {
            logger.warn("Registration failed - email already exists: {}", user.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }
        
        User savedUser = userService.registerUser(user);
        logger.info("Successfully registered user: {}", savedUser.getUsername());
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", savedUser.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        
        logger.info("Login attempt for user: {}", username);
        
        if (username == null || password == null) {
            logger.warn("Login failed - missing credentials for user: {}", username);
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }
        
        String token = userService.loginUser(username, password);
        if (token != null) {
            logger.info("Login successful for user: {}", username);
            return ResponseEntity.ok(Map.of("token", token));
        }
        
        logger.warn("Login failed - invalid credentials for user: {}", username);
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid username or password"));
    }
} 