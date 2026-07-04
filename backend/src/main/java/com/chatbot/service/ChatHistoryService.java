package com.chatbot.service;

import com.chatbot.entity.ChatMessage;
import com.chatbot.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {
    private final ChatMessageRepository repository;

    public void record(String sessionId, String role, String content, String mode) {
        repository.save(ChatMessage.builder()
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .mode(mode)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<ChatMessage> getMessages(String sessionId) {
        return repository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void clear(String sessionId) {
        repository.deleteBySessionId(sessionId);
    }
}
