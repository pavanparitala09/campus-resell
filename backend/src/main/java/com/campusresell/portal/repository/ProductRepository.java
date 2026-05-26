package com.campusresell.portal.repository;

import com.campusresell.portal.model.Product;
import com.campusresell.portal.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    
    // Recommendations (similar items in the same category, excluding current product)
    List<Product> findByCategoryAndIdNotAndStatusOrderByCreatedAtDesc(String category, Long id, ProductStatus status, Pageable pageable);
    
    // Trending items based on view counts
    List<Product> findByStatusOrderByViewCountDesc(ProductStatus status, Pageable pageable);
    
    // Recently active listings
    List<Product> findTop10ByStatusOrderByCreatedAtDesc(ProductStatus status);

    // Dynamic search and filter
    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "(:query IS NULL OR :query = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR :category = '' OR p.category = :category) AND " +
           "(:condition IS NULL OR :condition = '' OR p.condition = :condition) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchProducts(
            @Param("query") String query,
            @Param("category") String category,
            @Param("condition") String condition,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    long countByStatus(ProductStatus status);
}
