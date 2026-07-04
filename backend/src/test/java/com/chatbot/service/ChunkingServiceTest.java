package com.chatbot.service;

import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChunkingServiceTest {
    private final EmbeddingModel embeddingModel = mock(EmbeddingModel.class);
    private final ChunkingService service = new ChunkingService(embeddingModel);

    @Test
    void fixedStrategyProducesChunks() {
        var chunks = service.split("Nội dung bài giảng cấu trúc dữ liệu.", "fixed");

        assertFalse(chunks.isEmpty());
    }

    @Test
    void semanticStrategySplitsUnrelatedParagraphs() {
        when(embeddingModel.embed("Đoạn về cây nhị phân.")).thenReturn(new float[]{1.0f, 0.0f});
        when(embeddingModel.embed("Đoạn về bảng băm.")).thenReturn(new float[]{0.0f, 1.0f});

        var chunks = service.split("Đoạn về cây nhị phân.\n\nĐoạn về bảng băm.", "semantic");

        assertEquals(2, chunks.size());
    }

    @Test
    void hierarchicalStrategyKeepsParentHeading() {
        var chunks = service.split("CHƯƠNG 1: CÂY\nNội dung về cây nhị phân.", "hierarchical");

        assertEquals("CHƯƠNG 1: CÂY", chunks.get(0).getMetadata().get("parentHeading"));
        assertEquals("child", chunks.get(0).getMetadata().get("hierarchyLevel"));
    }
}
