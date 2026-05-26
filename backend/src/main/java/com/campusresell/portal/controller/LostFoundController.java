package com.campusresell.portal.controller;

import com.campusresell.portal.dto.LostFoundRequest;
import com.campusresell.portal.dto.LostFoundResponse;
import com.campusresell.portal.service.FileStorageService;
import com.campusresell.portal.service.LostFoundService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lost-found")
public class LostFoundController {

    @Autowired
    private LostFoundService lostFoundService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<LostFoundResponse>> getItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "false") boolean showResolved
    ) {
        List<LostFoundResponse> items = lostFoundService.searchItems(query, type, showResolved);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostFoundResponse> getItemDetails(@PathVariable Long id) {
        LostFoundResponse item = lostFoundService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/my")
    public ResponseEntity<List<LostFoundResponse>> getMyReports() {
        List<LostFoundResponse> reports = lostFoundService.getMyItems();
        return ResponseEntity.ok(reports);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createItem(
            @ModelAttribute @Valid LostFoundRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] files
    ) {
        try {
            List<String> imageUrls = new ArrayList<>();
            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String url = fileStorageService.storeFile(file);
                        imageUrls.add(url);
                    }
                }
            }

            LostFoundResponse response = lostFoundService.createItem(request, imageUrls);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateItem(
            @PathVariable Long id,
            @ModelAttribute @Valid LostFoundRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] files,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages
    ) {
        try {
            List<String> imageUrls = new ArrayList<>();
            if (existingImages != null) {
                imageUrls.addAll(existingImages);
            }

            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String url = fileStorageService.storeFile(file);
                        imageUrls.add(url);
                    }
                }
            }

            LostFoundResponse response = lostFoundService.updateItem(id, request, imageUrls);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> toggleResolved(@PathVariable Long id) {
        try {
            LostFoundResponse response = lostFoundService.toggleResolved(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            lostFoundService.deleteItem(id);
            return ResponseEntity.ok(Map.of("message", "Lost & Found listing deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
