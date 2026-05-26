package com.campusresell.portal.dto;

import com.campusresell.portal.model.Product;
import com.campusresell.portal.model.ProductImage;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private UserResponse seller;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String condition;
    private String status;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private List<String> images;

    public static ProductResponse fromProduct(Product product) {
        if (product == null) return null;
        return ProductResponse.builder()
                .id(product.getId())
                .seller(UserResponse.fromUser(product.getSeller()))
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .condition(product.getCondition())
                .status(product.getStatus().name())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .images(product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
                .build();
    }
}
