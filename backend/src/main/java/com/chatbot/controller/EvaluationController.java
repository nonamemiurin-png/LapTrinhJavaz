package com.chatbot.controller;

import com.chatbot.dto.ChatRequest;
import com.chatbot.dto.ChatResponse;
import com.chatbot.service.EvaluationService;
import com.chatbot.service.FineTunedModelService;
import com.chatbot.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluate")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final RagService ragService;
    private final FineTunedModelService fineTunedModelService;
    private final EvaluationService evaluationService;

    @PostMapping("/compare")
    public ResponseEntity<Map<String, Object>> compareModels(@RequestBody ChatRequest request) {
        Map<String, Object> comparison = new HashMap<>();
        
        // Get RAG response
        ChatResponse ragResponse = ragService.generateAnswer(
                request.getMessage(), request.getSessionId(), request.getSubject());
        comparison.put("rag_model", ragResponse);
        
        // Get Fine-Tuned response
        ChatResponse ftResponse = fineTunedModelService.generateAnswer(request.getMessage(), request.getSessionId());
        comparison.put("fine_tuned_model", ftResponse);

        if ("FINE_TUNED_UNAVAILABLE".equals(ftResponse.getMode())) {
            comparison.put("valid_experiment", false);
            comparison.put("evaluation_score", "Không chấm điểm vì chưa có mô hình fine-tuned thật.");
            return ResponseEntity.ok(comparison);
        }
        
        // Use LLM-as-a-judge to score both
        String evaluationScore = evaluationService.evaluateAndScore(
                request.getMessage(), 
                ragResponse.getAnswer(), 
                ftResponse.getAnswer()
        );
        comparison.put("evaluation_score", evaluationScore);
        comparison.put("valid_experiment", true);
        
        return ResponseEntity.ok(comparison);
    }
}
