package com.campusresell.portal.service;

import com.campusresell.portal.dto.ProductRequest;
import com.campusresell.portal.dto.ProductResponse;
import com.campusresell.portal.model.*;
import com.campusresell.portal.repository.ProductRepository;
import com.campusresell.portal.repository.SearchLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SearchLogRepository searchLogRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public Page<ProductResponse> getProducts(
            String query,
            String category,
            String condition,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            int page,
            int size
    ) {
        // Log search event for analytics
        User currentUser = authService.getCurrentUser();
        if ((query != null && !query.isBlank()) || (category != null && !category.isBlank())) {
            SearchLog log = SearchLog.builder()
                    .user(currentUser)
                    .query(query != null ? query.trim() : null)
                    .category(category != null ? category.trim() : null)
                    .build();
            searchLogRepository.save(log);
        }

        // Determine sorting criteria
        Sort sort = Sort.by("createdAt").descending(); // default: recently added
        if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("viewCount").descending();
        } else if ("priceAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("price").ascending();
        } else if ("priceDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("price").descending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.searchProducts(
                query, category, condition, minPrice, maxPrice, ProductStatus.AVAILABLE, pageable
        );

        return products.map(ProductResponse::fromProduct);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return ProductResponse.fromProduct(product);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, List<String> imageUrls) {
        User seller = authService.getCurrentUser();
        if (seller == null) {
            throw new IllegalStateException("Authentication required to list a product");
        }

        Product product = Product.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .condition(request.getCondition())
                .status(ProductStatus.AVAILABLE)
                .viewCount(0)
                .build();

        // Map images to product
        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<ProductImage> images = imageUrls.stream().map(url -> ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .build()).collect(Collectors.toList());
            product.setImages(images);
        }

        Product saved = productRepository.save(product);
        return ProductResponse.fromProduct(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<String> imageUrls) {
        User currentUser = authService.getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Access check: only seller or admin can update
        if (!product.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to edit this listing");
        }

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setCondition(request.getCondition());

        // Update images if provided
        if (imageUrls != null) {
            product.getImages().clear();
            List<ProductImage> newImages = imageUrls.stream().map(url -> ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .build()).collect(Collectors.toList());
            product.getImages().addAll(newImages);
        }

        Product updated = productRepository.save(product);
        return ProductResponse.fromProduct(updated);
    }

    @Transactional
    public ProductResponse updateProductStatus(Long id, ProductStatus status) {
        User currentUser = authService.getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to update status");
        }

        product.setStatus(status);
        productRepository.save(product);
        return ProductResponse.fromProduct(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        User currentUser = authService.getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getSeller().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("You are not authorized to delete this listing");
        }

        productRepository.delete(product);
    }

    public List<ProductResponse> getOwnListings() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required");
        }
        return productRepository.findBySellerIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getSimilarProducts(Long id, String category, int limit) {
        Pageable limitPageable = PageRequest.of(0, limit);
        return productRepository.findByCategoryAndIdNotAndStatusOrderByCreatedAtDesc(category, id, ProductStatus.AVAILABLE, limitPageable)
                .stream().map(ProductResponse::fromProduct).collect(Collectors.toList());
    }

    public List<ProductResponse> getTrendingProducts(int limit) {
        Pageable limitPageable = PageRequest.of(0, limit);
        return productRepository.findByStatusOrderByViewCountDesc(ProductStatus.AVAILABLE, limitPageable)
                .stream().map(ProductResponse::fromProduct).collect(Collectors.toList());
    }

    public List<ProductResponse> getRecentProducts() {
        return productRepository.findTop10ByStatusOrderByCreatedAtDesc(ProductStatus.AVAILABLE)
                .stream().map(ProductResponse::fromProduct).collect(Collectors.toList());
    }
}
