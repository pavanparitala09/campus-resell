package com.campusresell.portal.repository;

import com.campusresell.portal.model.LostFoundItem;
import com.campusresell.portal.model.LostFoundType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {

    List<LostFoundItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<LostFoundItem> findByResolvedTrueAndResolvedAtBefore(LocalDateTime cutoff);

    @Query("SELECT l FROM LostFoundItem l WHERE l.resolved = :resolved AND " +
           "(:type IS NULL OR l.type = :type) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<LostFoundItem> searchItems(
            @Param("query") String query,
            @Param("type") LostFoundType type,
            @Param("resolved") boolean resolved,
            Sort sort
    );
}
