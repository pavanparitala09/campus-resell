package com.campusresell.portal.dto;

import com.campusresell.portal.model.Chat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Long id;
    private ProductResponse product;
    private LostFoundResponse lostFoundItem;
    private UserResponse buyer;
    private UserResponse seller;
    private LocalDateTime createdAt;
    private MessageResponse lastMessage;

    public static ChatResponse fromChat(Chat chat) {
        if (chat == null) return null;
        return ChatResponse.builder()
                .id(chat.getId())
                .product(ProductResponse.fromProduct(chat.getProduct()))
                .lostFoundItem(LostFoundResponse.fromItem(chat.getLostFoundItem()))
                .buyer(UserResponse.fromUser(chat.getBuyer()))
                .seller(UserResponse.fromUser(chat.getSeller()))
                .createdAt(chat.getCreatedAt())
                .build();
    }
}
