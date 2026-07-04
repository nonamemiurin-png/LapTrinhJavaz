package com.chatbot.controller;

import com.chatbot.repository.MetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {

    private final MetricRepository metricRepository;

    @GetMapping("/comparison")
    public ResponseEntity<List<Map<String, Object>>> getModelComparison(
            @RequestParam(value = "days", defaultValue = "7") int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Map<String, Object>> comparison = metricRepository.getModelComparison(since);
        return ResponseEntity.ok(comparison);
    }
}
