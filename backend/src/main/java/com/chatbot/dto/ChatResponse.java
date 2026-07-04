package com.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String answer;
    private String mode;
    private List<String> sources; // List of document names or chunks cited
    private List<Citation> citations;
}
