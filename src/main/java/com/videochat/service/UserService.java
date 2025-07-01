package com.videochat.service;

import com.videochat.model.User;
import com.videochat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostConstruct
    public void init() {
        // Create demo user if it doesn't exist
        if (!userRepository.existsByUsername("demo")) {
            User demoUser = new User();
            demoUser.setUsername("demo");
            demoUser.setEmail("demo@example.com");
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setFullName("Demo User");
            userRepository.save(demoUser);
        }
    }

    public User registerUser(User user) {
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String loginUser(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(user -> jwtService.generateToken(user.getUsername()))
                .orElse(null);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
} 