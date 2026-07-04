package com.chatbot.controller;

import com.chatbot.entity.ChatMessage;
import com.chatbot.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatHistoryController {
    private final ChatHistoryService historyService;

    @GetMapping("/{sessionId}/messages")
    public List<ChatMessage> getMessages(@PathVariable String sessionId) {
        return historyService.getMessages(sessionId);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        historyService.clear(sessionId);
        return ResponseEntity.noContent().build();
    }
}
