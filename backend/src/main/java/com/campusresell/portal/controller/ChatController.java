package com.campusresell.portal.controller;

import com.campusresell.portal.dto.ChatResponse;
import com.campusresell.portal.dto.MessageRequest;
import com.campusresell.portal.dto.MessageResponse;
import com.campusresell.portal.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<?> startChat(@RequestBody Map<String, Long> body) {
        Long productId = body.get("productId");
        Long lostFoundItemId = body.get("lostFoundItemId");
        
        if (productId == null && lostFoundItemId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId or lostFoundItemId is required"));
        }

        try {
            ChatResponse chat;
            if (productId != null) {
                chat = chatService.startChat(productId);
            } else {
                chat = chatService.startLostFoundChat(lostFoundItemId);
            }
            return ResponseEntity.ok(chat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getMyInbox() {
        List<ChatResponse> chats = chatService.getMyChats();
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<?> getChatHistory(@PathVariable Long chatId) {
        try {
            List<MessageResponse> messages = chatService.getChatMessages(chatId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long chatId,
            @Valid @RequestBody MessageRequest request
    ) {
        try {
            MessageResponse response = chatService.sendMessage(chatId, request.getContent());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
