package com.campusresell.portal.dto;

import com.campusresell.portal.model.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse fromNotification(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
