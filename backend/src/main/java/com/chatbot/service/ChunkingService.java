package com.chatbot.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChunkingService {
    public static final String FIXED = "fixed";
    public static final String SEMANTIC = "semantic";
    public static final String HIERARCHICAL = "hierarchical";

    private final EmbeddingModel embeddingModel;

    public List<Document> split(String text, String strategy) {
        String normalized = strategy == null ? FIXED : strategy.toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case SEMANTIC -> semanticSplit(text);
            case HIERARCHICAL -> hierarchicalSplit(text);
            case FIXED -> fixedSplit(text);
            default -> throw new IllegalArgumentException("Chunking strategy không hợp lệ: " + strategy);
        };
    }

    private List<Document> fixedSplit(String text) {
        return new TokenTextSplitter(500, 100, 10, 1000, true)
                .split(List.of(new Document(text)));
    }

    private List<Document> semanticSplit(String text) {
        List<String> paragraphs = paragraphs(text);
        if (paragraphs.size() < 2) return fixedSplit(text);

        List<Document> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder(paragraphs.get(0));
        float[] previousEmbedding = embeddingModel.embed(paragraphs.get(0));
        for (int i = 1; i < paragraphs.size(); i++) {
            String paragraph = paragraphs.get(i);
            float[] embedding = embeddingModel.embed(paragraph);
            boolean sameTopic = cosine(previousEmbedding, embedding) >= 0.65;
            boolean withinSize = current.length() + paragraph.length() <= 2400;
            if (sameTopic && withinSize) {
                current.append("\n\n").append(paragraph);
            } else {
                chunks.add(document(current.toString(), Map.of("chunkStrategy", SEMANTIC)));
                current = new StringBuilder(paragraph);
            }
            previousEmbedding = embedding;
        }
        chunks.add(document(current.toString(), Map.of("chunkStrategy", SEMANTIC)));
        return chunks;
    }

    private List<Document> hierarchicalSplit(String text) {
        List<Document> chunks = new ArrayList<>();
        String parentHeading = "Tài liệu";
        StringBuilder section = new StringBuilder();
        for (String line : text.split("\\R")) {
            String trimmed = line.trim();
            if (isHeading(trimmed)) {
                addHierarchicalSection(chunks, parentHeading, section.toString());
                parentHeading = trimmed;
                section = new StringBuilder();
            } else if (!trimmed.isEmpty()) {
                section.append(trimmed).append('\n');
            }
        }
        addHierarchicalSection(chunks, parentHeading, section.toString());
        return chunks.isEmpty() ? fixedSplit(text) : chunks;
    }

    private void addHierarchicalSection(List<Document> chunks, String heading, String section) {
        if (section.isBlank()) return;
        for (Document child : fixedSplit(section)) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("chunkStrategy", HIERARCHICAL);
            metadata.put("hierarchyLevel", "child");
            metadata.put("parentHeading", heading);
            chunks.add(document("[" + heading + "]\n" + child.getText(), metadata));
        }
    }

    private List<String> paragraphs(String text) {
        List<String> result = new ArrayList<>();
        for (String paragraph : text.split("(?:\\R\\s*){2,}")) {
            if (!paragraph.isBlank()) result.add(paragraph.trim());
        }
        return result;
    }

    private boolean isHeading(String line) {
        return line.matches("(?iu)^(chương|chapter|phần|bài|mục)\\s+.*")
                || (line.length() < 120 && line.endsWith(":"));
    }

    private double cosine(float[] left, float[] right) {
        double dot = 0, leftNorm = 0, rightNorm = 0;
        for (int i = 0; i < Math.min(left.length, right.length); i++) {
            dot += left[i] * right[i];
            leftNorm += left[i] * left[i];
            rightNorm += right[i] * right[i];
        }
        return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm) + 1e-12);
    }

    private Document document(String content, Map<String, Object> metadata) {
        return new Document(content, new HashMap<>(metadata));
    }
}
