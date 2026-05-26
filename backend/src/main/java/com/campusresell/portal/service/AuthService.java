package com.campusresell.portal.service;

import com.campusresell.portal.dto.*;
import com.campusresell.portal.model.*;
import com.campusresell.portal.repository.*;
import com.campusresell.portal.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MailService mailService;

    @Transactional
    public void sendVerificationOtp(String email) {
        // Enforce .edu.in domain check
        if (!email.toLowerCase().endsWith(".edu.in")) {
            throw new IllegalArgumentException("Only college email addresses (.edu.in) are allowed");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        EmailVerification verification = emailVerificationRepository.findById(email)
                .orElse(new EmailVerification());
        
        verification.setEmail(email);
        verification.setOtp(otp);
        verification.setExpiresAt(expiresAt);
        verification.setVerified(false);

        emailVerificationRepository.save(verification);
        mailService.sendOtp(email, otp);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        EmailVerification verification = emailVerificationRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("No verification session found for this email"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP code has expired. Please request a new one.");
        }

        if (!verification.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP code. Please try again.");
        }

        verification.setVerified(true);
        emailVerificationRepository.save(verification);
        return true;
    }

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        String email = request.getCollegeEmail().toLowerCase().trim();

        // Enforce .edu.in domain check
        if (!email.endsWith(".edu.in")) {
            throw new IllegalArgumentException("Only college email addresses ending with .edu.in are allowed");
        }

        // 1. Check if user already exists
        if (userRepository.existsByCollegeEmail(email)) {
            throw new IllegalArgumentException("Email is already registered. Please log in.");
        }

        // First user registered becomes ADMIN automatically
        UserRole role = userRepository.count() == 0 ? UserRole.ADMIN : UserRole.USER;

        // 3. Create User
        User user = User.builder()
                .collegeEmail(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(role)
                .verified(true)
                .build();

        User savedUser = userRepository.save(user);

        // Clean up any draft OTP session if present
        emailVerificationRepository.findById(email).ifPresent(v -> emailVerificationRepository.delete(v));

        return UserResponse.fromUser(savedUser);
    }

    public LoginResponse loginUser(LoginRequest request) {
        String email = request.getCollegeEmail().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByCollegeEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return LoginResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            return null;
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getUser();
    }
    
    public UserResponse updateProfile(String name, String profilePic) {
        User user = getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("No user currently logged in");
        }
        
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        dbUser.setName(name);
        if (profilePic != null && !profilePic.isBlank()) {
            dbUser.setProfilePic(profilePic);
        }
        
        userRepository.save(dbUser);
        return UserResponse.fromUser(dbUser);
    }
}
