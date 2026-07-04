package com.chatbot.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Native Gemini embedding adapter.
 *
 * Spring AI 1.0.0-M1 expects an OpenAI "usage" object in embedding responses,
 * while Gemini's OpenAI-compatible endpoint does not provide it. Calling the
 * native embedContent endpoint avoids that incompatibility and keeps pgvector
 * at the configured 768 dimensions.
 */
@Component
@Primary
public class GeminiEmbeddingModel implements EmbeddingModel {

    private static final int DIMENSIONS = 768;
    private static final String MODEL = "gemini-embedding-001";

    private final RestClient restClient;
    private final String apiKey;

    public GeminiEmbeddingModel(RestClient.Builder restClientBuilder,
                                @Value("${spring.ai.openai.api-key}") String apiKey) {
        this.restClient = restClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.apiKey = apiKey;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<Embedding> embeddings = new ArrayList<>();
        List<String> inputs = request.getInstructions();
        for (int index = 0; index < inputs.size(); index++) {
            embeddings.add(new Embedding(embedText(inputs.get(index)), index));
        }
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return embedText(document.getText());
    }

    @Override
    public int dimensions() {
        return DIMENSIONS;
    }

    private float[] embedText(String text) {
        Map<String, Object> body = Map.of(
                "model", "models/" + MODEL,
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "output_dimensionality", DIMENSIONS
        );

        GeminiEmbeddingResponse response = restClient.post()
                .uri("/v1beta/models/{model}:embedContent", MODEL)
                .header("x-goog-api-key", apiKey)
                .body(Objects.requireNonNull(body))
                .retrieve()
                .body(GeminiEmbeddingResponse.class);

        if (response == null || response.embedding() == null || response.embedding().values() == null) {
            throw new IllegalStateException("Gemini không trả về embedding hợp lệ");
        }
        if (response.embedding().values().size() != DIMENSIONS) {
            throw new IllegalStateException("Embedding dimension không hợp lệ: "
                    + response.embedding().values().size());
        }
        float[] result = new float[DIMENSIONS];
        for (int index = 0; index < DIMENSIONS; index++) {
            result[index] = response.embedding().values().get(index).floatValue();
        }
        return result;
    }

    private record GeminiEmbeddingResponse(GeminiEmbedding embedding) {
    }

    private record GeminiEmbedding(List<Double> values) {
    }
}
