package com.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class ChatRequest {
    @JsonAlias("query")
    private String message;
    private String mode; // "rag" or "finetuned"
    private String sessionId; // For chat memory
    private String subject;
}
