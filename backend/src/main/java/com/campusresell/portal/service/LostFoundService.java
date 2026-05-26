package com.campusresell.portal.service;

import com.campusresell.portal.dto.LostFoundRequest;
import com.campusresell.portal.dto.LostFoundResponse;
import com.campusresell.portal.model.*;
import com.campusresell.portal.repository.LostFoundItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LostFoundService {

    private static final Logger logger = LoggerFactory.getLogger(LostFoundService.class);

    @Autowired
    private LostFoundItemRepository lostFoundItemRepository;

    @Autowired
    private AuthService authService;

    public List<LostFoundResponse> searchItems(String query, String typeStr, boolean showResolved) {
        LostFoundType type = null;
        if (typeStr != null && !typeStr.isBlank()) {
            try {
                type = LostFoundType.valueOf(typeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid type parameter
            }
        }

        Sort sort = Sort.by("createdAt").descending();
        List<LostFoundItem> items = lostFoundItemRepository.searchItems(query, type, showResolved, sort);

        return items.stream()
                .map(LostFoundResponse::fromItem)
                .collect(Collectors.toList());
    }

    public LostFoundResponse getItemById(Long id) {
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lost & Found report not found with id: " + id));
        return LostFoundResponse.fromItem(item);
    }

    @Transactional
    public LostFoundResponse createItem(LostFoundRequest request, List<String> imageUrls) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Authentication required to report items");
        }

        LostFoundType type;
        try {
            type = LostFoundType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid type: must be LOST or FOUND");
        }

        LostFoundItem item = LostFoundItem.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(type)
                .location(request.getLocation())
                .resolved(false)
                .build();

        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<LostFoundImage> images = imageUrls.stream().map(url -> LostFoundImage.builder()
                    .lostFoundItem(item)
                    .imageUrl(url)
                    .build()).collect(Collectors.toList());
            item.setImages(images);
        }

        LostFoundItem saved = lostFoundItemRepository.save(item);
        return LostFoundResponse.fromItem(saved);
    }

    @Transactional
    public LostFoundResponse updateItem(Long id, LostFoundRequest request, List<String> imageUrls) {
        User currentUser = authService.getCurrentUser();
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!item.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to edit this report");
        }

        LostFoundType type;
        try {
            type = LostFoundType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid type: must be LOST or FOUND");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(type);
        item.setLocation(request.getLocation());

        if (imageUrls != null) {
            item.getImages().clear();
            List<LostFoundImage> newImages = imageUrls.stream().map(url -> LostFoundImage.builder()
                    .lostFoundItem(item)
                    .imageUrl(url)
                    .build()).collect(Collectors.toList());
            item.getImages().addAll(newImages);
        }

        LostFoundItem updated = lostFoundItemRepository.save(item);
        return LostFoundResponse.fromItem(updated);
    }

    @Transactional
    public LostFoundResponse toggleResolved(Long id) {
        User currentUser = authService.getCurrentUser();
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!item.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to update this status");
        }

        boolean prevResolved = item.isResolved();
        item.setResolved(!prevResolved);
        
        if (!prevResolved) {
            // Newly resolved/claimed
            item.setResolvedAt(LocalDateTime.now());
        } else {
            // Unmarked as claimed
            item.setResolvedAt(null);
        }

        lostFoundItemRepository.save(item);
        return LostFoundResponse.fromItem(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        User currentUser = authService.getCurrentUser();
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!item.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to delete this report");
        }

        lostFoundItemRepository.delete(item);
    }

    public List<LostFoundResponse> getMyItems() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required");
        }
        return lostFoundItemRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(LostFoundResponse::fromItem)
                .collect(Collectors.toList());
    }

    // Cron job to run every day at midnight (00:00:00) to delete resolved items > 7 days old
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteExpiredClaimedItems() {
        logger.info("Starting scheduled deletion check for claimed Lost & Found listings older than 7 days...");
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<LostFoundItem> expiredItems = lostFoundItemRepository.findByResolvedTrueAndResolvedAtBefore(cutoff);
        
        if (!expiredItems.isEmpty()) {
            logger.info("Found {} expired claimed listings. Deleting records...", expiredItems.size());
            lostFoundItemRepository.deleteAll(expiredItems);
        } else {
            logger.info("No expired claimed Lost & Found listings detected.");
        }
    }
}
