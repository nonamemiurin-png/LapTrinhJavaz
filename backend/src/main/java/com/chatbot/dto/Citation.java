package com.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Citation {
    private String filename;
    private String subject;
    private String chapter;
    private String chunkId;
    private String excerpt;
}
