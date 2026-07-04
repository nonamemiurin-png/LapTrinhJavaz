package com.chatbot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = @Index(name = "idx_chat_session_created", columnList = "sessionId,createdAt"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String sessionId;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 30)
    private String mode;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
