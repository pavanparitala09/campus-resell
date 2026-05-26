package com.campusresell.portal.repository;

import com.campusresell.portal.model.SearchLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    
    @Query("SELECT s.category, COUNT(s) FROM SearchLog s WHERE s.category IS NOT NULL AND s.category != '' GROUP BY s.category ORDER BY COUNT(s) DESC")
    List<Object[]> findMostSearchedCategories(Pageable pageable);
    
    @Query("SELECT s.query, COUNT(s) FROM SearchLog s WHERE s.query IS NOT NULL AND s.query != '' GROUP BY s.query ORDER BY COUNT(s) DESC")
    List<Object[]> findMostSearchedQueries(Pageable pageable);
}
