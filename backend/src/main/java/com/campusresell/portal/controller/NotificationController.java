package com.campusresell.portal.controller;

import com.campusresell.portal.dto.NotificationResponse;
import com.campusresell.portal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        List<NotificationResponse> list = notificationService.getMyNotifications();
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
