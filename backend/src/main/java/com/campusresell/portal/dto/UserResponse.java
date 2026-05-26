package com.campusresell.portal.dto;

import com.campusresell.portal.model.User;
import com.campusresell.portal.model.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String collegeEmail;
    private String name;
    private String profilePic;
    private UserRole role;
    private boolean verified;
    private LocalDateTime createdAt;

    public static UserResponse fromUser(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .collegeEmail(user.getCollegeEmail())
                .name(user.getName())
                .profilePic(user.getProfilePic())
                .role(user.getRole())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
