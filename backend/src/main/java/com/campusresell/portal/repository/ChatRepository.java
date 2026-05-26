package com.campusresell.portal.repository;

import com.campusresell.portal.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    @Query("SELECT c FROM Chat c WHERE c.buyer.id = :userId OR c.seller.id = :userId ORDER BY c.createdAt DESC")
    List<Chat> findAllUserChats(@Param("userId") Long userId);
    
    Optional<Chat> findByProductIdAndBuyerId(Long productId, Long buyerId);
    
    Optional<Chat> findByLostFoundItemIdAndBuyerId(Long lostFoundItemId, Long buyerId);
}
