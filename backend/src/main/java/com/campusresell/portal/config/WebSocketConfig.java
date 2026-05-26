package com.campusresell.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Expose websocket endpoint at /ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
                
        // Expose websocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple memory-based broker to carry messages to clients
        registry.enableSimpleBroker("/topic", "/queue");
        
        // Define application destination prefix for client-to-server routing
        registry.setApplicationDestinationPrefixes("/app");
        
        // User destination prefix for private messaging
        registry.setUserDestinationPrefix("/user");
    }
}
