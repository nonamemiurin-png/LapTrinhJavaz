package com.chatbot.controller;

import com.chatbot.dto.ChatRequest;
import com.chatbot.dto.ChatResponse;
import com.chatbot.service.FineTunedModelService;
import com.chatbot.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For local development frontend access
public class ChatController {

    private final RagService ragService;
    private final FineTunedModelService fineTunedModelService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getMode() != null && request.getMode().toLowerCase().contains("fine")) {
            return ResponseEntity.ok(fineTunedModelService.generateAnswer(request.getMessage(), request.getSessionId()));
        }
        
        // Default to RAG
        return ResponseEntity.ok(ragService.generateAnswer(
                request.getMessage(), request.getSessionId(), request.getSubject()));
    }
}
