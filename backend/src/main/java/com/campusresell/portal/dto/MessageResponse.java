package com.campusresell.portal.dto;

import com.campusresell.portal.model.Message;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private Long chatId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;

    public static MessageResponse fromMessage(Message message) {
        if (message == null) return null;
        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }
}
