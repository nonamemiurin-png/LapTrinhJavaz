package com.chatbot.controller;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation")
@CrossOrigin(origins = "*")
public class RetrievalEvaluationController {

    private final VectorStore vectorStore;

    public RetrievalEvaluationController(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @PostMapping("/retrieve")
    public ResponseEntity<Map<String, Object>> retrieve(@RequestBody Map<String, Object> payload) {
        String question = String.valueOf(payload.getOrDefault("question", "")).trim();
        String subject = String.valueOf(payload.getOrDefault("subject", "")).trim();
        int topK = Math.max(1, Math.min(20, ((Number) payload.getOrDefault("topK", 5)).intValue()));
        if (question.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        SearchRequest.Builder builder = SearchRequest.builder().query(question).topK(topK);
        if (!subject.isBlank()) {
            builder.filterExpression(new FilterExpressionBuilder().eq("subject", subject).build());
        }
        List<Document> documents = vectorStore.similaritySearch(builder.build());
        List<Map<String, Object>> hits = documents.stream().map(document -> Map.<String, Object>of(
                "chunkId", document.getId(),
                "filename", String.valueOf(document.getMetadata().getOrDefault("filename", "")),
                "chapter", String.valueOf(document.getMetadata().getOrDefault("chapter", "")),
                "score", document.getScore() == null ? 0.0 : document.getScore()
        )).toList();
        return ResponseEntity.ok(Map.of("hits", hits, "topK", topK));
    }
}
