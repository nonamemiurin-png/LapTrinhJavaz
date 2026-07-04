package com.chatbot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String filename;
    
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    
    @Column(length = 50)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED
    
    private Integer totalChunks;
    private String contentType;

    @Column(length = 200)
    private String subject;

    @Column(length = 200)
    private String chapter;

    @Column(length = 30)
    private String chunkStrategy;

    public String getChunkStrategy() {
        return chunkStrategy == null || chunkStrategy.isBlank() ? "fixed" : chunkStrategy;
    }
    
    @Column(length = 1000)
    private String errorMessage;
}
