package com.campusresell.portal;

import com.campusresell.portal.model.User;
import com.campusresell.portal.model.UserRole;
import com.campusresell.portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class PortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(PortalApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "23eg112e52@anurag.edu.in";
            if (!userRepository.existsByCollegeEmail(adminEmail)) {
                User admin = User.builder()
                        .name("Admin")
                        .collegeEmail(adminEmail)
                        .passwordHash(passwordEncoder.encode("pavan@9963"))
                        .role(UserRole.ADMIN)
                        .verified(true)
                        .build();
                userRepository.save(admin);
                System.out.println("Admin user initialized successfully: " + adminEmail);
            } else {
                User admin = userRepository.findByCollegeEmail(adminEmail).get();
                admin.setRole(UserRole.ADMIN);
                admin.setPasswordHash(passwordEncoder.encode("pavan@9963"));
                userRepository.save(admin);
                System.out.println("Admin user verified and updated successfully: " + adminEmail);
            }
        };
    }
}
