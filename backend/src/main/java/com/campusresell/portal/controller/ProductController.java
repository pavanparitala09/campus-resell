package com.campusresell.portal.controller;

import com.campusresell.portal.dto.ProductRequest;
import com.campusresell.portal.dto.ProductResponse;
import com.campusresell.portal.model.ProductStatus;
import com.campusresell.portal.service.FileStorageService;
import com.campusresell.portal.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "recent") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductResponse> products = productService.getProducts(
                query, category, condition, minPrice, maxPrice, sortBy, page, size
        );
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductDetails(@PathVariable Long id) {
        // Fetch details
        ProductResponse product = productService.getProductById(id);
        // Proactively increment view count
        productService.incrementViewCount(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProductResponse>> getMyListings() {
        List<ProductResponse> listings = productService.getOwnListings();
        return ResponseEntity.ok(listings);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
            @ModelAttribute @Valid ProductRequest request,
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

            ProductResponse response = productService.createProduct(request, imageUrls);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @ModelAttribute @Valid ProductRequest request,
            @RequestParam(value = "images", required = false) MultipartFile[] files,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages
    ) {
        try {
            List<String> imageUrls = new ArrayList<>();
            
            // Keep existing images if they are still part of the listing
            if (existingImages != null) {
                imageUrls.addAll(existingImages);
            }

            // Upload new images
            if (files != null && files.length > 0) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String url = fileStorageService.storeFile(file);
                        imageUrls.add(url);
                    }
                }
            }

            ProductResponse response = productService.updateProduct(id, request, imageUrls);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        try {
            ProductStatus status = ProductStatus.valueOf(statusStr.toUpperCase());
            ProductResponse response = productService.updateProductStatus(id, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value: " + statusStr));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(
            @RequestParam(required = false) Long currentProductId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "4") int limit
    ) {
        List<ProductResponse> recommendations;
        if (currentProductId != null && category != null) {
            recommendations = productService.getSimilarProducts(currentProductId, category, limit);
        } else {
            recommendations = productService.getTrendingProducts(limit);
        }
        return ResponseEntity.ok(recommendations);
    }
}
