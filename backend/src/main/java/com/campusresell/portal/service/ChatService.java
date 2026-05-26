package com.campusresell.portal.service;

import com.campusresell.portal.dto.ChatResponse;
import com.campusresell.portal.dto.MessageResponse;
import com.campusresell.portal.model.*;
import com.campusresell.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LostFoundItemRepository lostFoundItemRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatResponse startChat(Long productId) {
        User buyer = authService.getCurrentUser();
        if (buyer == null) {
            throw new IllegalStateException("Authentication required to chat");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot start a chat with yourself for your own listing");
        }

        // Check if chat already exists
        Optional<Chat> existingChat = chatRepository.findByProductIdAndBuyerId(productId, buyer.getId());
        Chat chat;
        if (existingChat.isPresent()) {
            chat = existingChat.get();
        } else {
            chat = Chat.builder()
                    .product(product)
                    .buyer(buyer)
                    .seller(product.getSeller())
                    .build();
            chat = chatRepository.save(chat);
        }

        ChatResponse response = ChatResponse.fromChat(chat);
        populateLastMessage(response);
        return response;
    }

    @Transactional
    public ChatResponse startLostFoundChat(Long lostFoundItemId) {
        User buyer = authService.getCurrentUser();
        if (buyer == null) {
            throw new IllegalStateException("Authentication required to chat");
        }

        LostFoundItem item = lostFoundItemRepository.findById(lostFoundItemId)
                .orElseThrow(() -> new IllegalArgumentException("Lost & Found item not found"));

        if (item.getUser().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot start a chat with yourself");
        }

        // Check if chat already exists
        Optional<Chat> existingChat = chatRepository.findByLostFoundItemIdAndBuyerId(lostFoundItemId, buyer.getId());
        Chat chat;
        if (existingChat.isPresent()) {
            chat = existingChat.get();
        } else {
            chat = Chat.builder()
                    .lostFoundItem(item)
                    .buyer(buyer)
                    .seller(item.getUser())
                    .build();
            chat = chatRepository.save(chat);
        }

        ChatResponse response = ChatResponse.fromChat(chat);
        populateLastMessage(response);
        return response;
    }

    public List<ChatResponse> getMyChats() {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("Authentication required");
        }

        List<Chat> chats = chatRepository.findAllUserChats(currentUser.getId());
        return chats.stream().map(chat -> {
            ChatResponse res = ChatResponse.fromChat(chat);
            populateLastMessage(res);
            return res;
        }).collect(Collectors.toList());
    }

    public List<MessageResponse> getChatMessages(Long chatId) {
        User currentUser = authService.getCurrentUser();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat thread not found"));

        // Access check
        if (!chat.getBuyer().getId().equals(currentUser.getId()) && !chat.getSeller().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("You are not a participant in this conversation");
        }

        return messageRepository.findByChatIdOrderByTimestampAsc(chatId).stream()
                .map(MessageResponse::fromMessage)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(Long chatId, String content) {
        User sender = authService.getCurrentUser();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat thread not found"));

        if (!chat.getBuyer().getId().equals(sender.getId()) && !chat.getSeller().getId().equals(sender.getId())) {
            throw new IllegalStateException("You are not a participant in this conversation");
        }

        Message message = Message.builder()
                .chat(chat)
                .sender(sender)
                .content(content)
                .build();

        Message saved = messageRepository.save(message);
        MessageResponse response = MessageResponse.fromMessage(saved);

        // Find receiver
        User receiver = chat.getBuyer().getId().equals(sender.getId()) ? chat.getSeller() : chat.getBuyer();

        // Create alert notification
        String title = chat.getProduct() != null ? chat.getProduct().getTitle() : chat.getLostFoundItem().getTitle();
        notificationService.createNotification(
                receiver,
                "MESSAGE",
                "New message from " + sender.getName() + " on '" + title + "'"
        );

        // Broadcast over WebSockets
        // 1. Send to the chat room topic
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, response);

        // 2. Send to user specific inbox notifications topic
        messagingTemplate.convertAndSendToUser(receiver.getCollegeEmail(), "/queue/messages", response);

        return response;
    }

    private void populateLastMessage(ChatResponse chatResponse) {
        List<Message> messages = messageRepository.findByChatIdOrderByTimestampAsc(chatResponse.getId());
        if (!messages.isEmpty()) {
            chatResponse.setLastMessage(MessageResponse.fromMessage(messages.get(messages.size() - 1)));
        }
    }
}
