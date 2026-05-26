package com.campusresell.portal.controller;

import com.campusresell.portal.dto.*;
import com.campusresell.portal.model.User;
import com.campusresell.portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        try {
            authService.sendVerificationOtp(email.trim());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification OTP sent successfully to your college email");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            authService.verifyOtp(request.getEmail().trim(), request.getOtp().trim());
            return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully. You can now complete your registration.",
                "email", request.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserResponse response = authService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.loginUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        User user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(UserResponse.fromUser(user));
    }
    
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String profilePic = request.get("profilePic");
        
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        }
        
        try {
            UserResponse response = authService.updateProfile(name, profilePic);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
