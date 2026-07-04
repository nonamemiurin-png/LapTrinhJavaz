package com.chatbot.service;

import com.chatbot.dto.ChatResponse;
import com.chatbot.entity.Metric;
import com.chatbot.repository.MetricRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@Service
@Slf4j
public class FineTunedModelService {

    private final RestClient restClient;
    private final String endpoint;
    private final String model;
    private final MetricRepository metricRepository;
    private final ChatHistoryService chatHistoryService;

    public FineTunedModelService(RestClient.Builder builder,
                                 @Value("${app.finetuned.endpoint:}") String endpoint,
                                 @Value("${app.finetuned.model:qwen2.5:0.5b}") String model,
                                 MetricRepository metricRepository,
                                 ChatHistoryService chatHistoryService) {
        this.restClient = builder.build();
        this.endpoint = endpoint;
        this.model = model;
        this.metricRepository = metricRepository;
        this.chatHistoryService = chatHistoryService;
    }

    public ChatResponse generateAnswer(String query, String sessionId) {
        long startedAt = System.nanoTime();
        log.info("Received Fine-Tuned Model query: {} for session: {}", query, sessionId);
        String resolvedSessionId = sessionId == null || sessionId.isBlank() ? "default-session" : sessionId;
        chatHistoryService.record(resolvedSessionId, "USER", query, "FINE_TUNED");

        if (endpoint == null || endpoint.isBlank()) {
            String unavailable = "Chưa cấu hình endpoint cho mô hình fine-tuned. "
                    + "Đặt FINE_TUNED_MODEL_ENDPOINT trước khi benchmark.";
            chatHistoryService.record(resolvedSessionId, "ASSISTANT", unavailable, "FINE_TUNED_UNAVAILABLE");
            return ChatResponse.builder()
                    .answer(unavailable)
                    .mode("FINE_TUNED_UNAVAILABLE")
                    .sources(List.of())
                    .citations(List.of())
                    .build();
        }

        OllamaResponse response = restClient.post()
                .uri(endpoint)
                .body(Map.of(
                        "model", model,
                        "prompt", query,
                        "stream", false
                ))
                .retrieve()
                .body(OllamaResponse.class);

        if (response == null || response.response() == null || response.response().isBlank()) {
            throw new IllegalStateException("Fine-tuned endpoint không trả về nội dung hợp lệ");
        }
        metricRepository.save(Metric.builder()
                .model("FINE_TUNED")
                .latencyMs((System.nanoTime() - startedAt) / 1_000_000)
                .recordedAt(LocalDateTime.now())
                .build());
        chatHistoryService.record(resolvedSessionId, "ASSISTANT", response.response(), "FINE_TUNED");

        return ChatResponse.builder()
                .answer(response.response())
                .mode("FINE_TUNED")
                .sources(List.of())
                .citations(List.of())
                .build();
    }

    private record OllamaResponse(String response) {
    }
}
