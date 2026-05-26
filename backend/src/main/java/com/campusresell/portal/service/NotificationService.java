package com.campusresell.portal.service;

import com.campusresell.portal.dto.NotificationResponse;
import com.campusresell.portal.model.Notification;
import com.campusresell.portal.model.User;
import com.campusresell.portal.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public void createNotification(User user, String type, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required");
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(NotificationResponse::fromNotification)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id) {
        User currentUser = authService.getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("You are not authorized to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) return;
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) return 0;
        return notificationRepository.countByUserIdAndRead(currentUser.getId(), false);
    }
}
