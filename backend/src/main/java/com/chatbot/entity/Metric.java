package com.chatbot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Metric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String model; // RAG, FINE_TUNED, HYBRID
    private Long latencyMs;
    private Integer inputTokens;
    private Integer outputTokens;
    private Double accuracyScore; // 0.0 - 1.0 (LLM-as-a-judge score scale 10 normalized or custom)
    private LocalDateTime recordedAt;
}
