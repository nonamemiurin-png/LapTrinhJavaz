package com.chatbot.repository;

import com.chatbot.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    void deleteBySessionId(String sessionId);
}
