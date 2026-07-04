package com.chatbot.service;

import com.chatbot.entity.Document;
import com.chatbot.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessingService {

    private final DocumentRepository documentRepository;
    private final VectorStore vectorStore;
    private final DocumentParser documentParser;
    private final JdbcTemplate jdbcTemplate;
    private final ChunkingService chunkingService;

    public void deleteVectors(Long documentId) {
        jdbcTemplate.update(
                "DELETE FROM vector_store WHERE metadata->>'documentId' = ?",
                Objects.requireNonNull(documentId).toString()
        );
    }

    @Async
    public void processDocument(Long documentId) {
        log.info("Bắt đầu xử lý bất đồng bộ Document ID: {}", documentId);
        Document document = documentRepository.findById(Objects.requireNonNull(documentId)).orElse(null);
        if (document == null) {
            log.error("Không tìm thấy Document ID: {}", documentId);
            return;
        }

        try {
            document.setStatus("PROCESSING");
            documentRepository.save(document);

            // 1. Trích xuất text từ file tài liệu
            String text = documentParser.parse(document.getFilePath(), document.getContentType());
            if (text == null || text.trim().isEmpty()) {
                throw new RuntimeException("Tài liệu không có nội dung văn bản hợp lệ.");
            }

            // 2. Chia text thành các chunk bằng TokenTextSplitter
            List<org.springframework.ai.document.Document> springAiDocs =
                    chunkingService.split(text, document.getChunkStrategy());

            log.info("Đã chia tài liệu {} thành {} chunks", document.getFilename(), springAiDocs.size());

            // 3. Thêm Metadata documentId để tiện truy xuất khi RAG
            for (org.springframework.ai.document.Document doc : springAiDocs) {
                doc.getMetadata().put("documentId", documentId.toString());
                doc.getMetadata().put("filename", document.getFilename());
                doc.getMetadata().put("subject", document.getSubject());
                doc.getMetadata().put("chapter", document.getChapter());
                doc.getMetadata().put("chunkStrategy", document.getChunkStrategy());
            }

            // 4. Lưu vào Postgres pgvector qua VectorStore (tự động call embedding API)
            vectorStore.accept(springAiDocs);

            document.setStatus("COMPLETED");
            document.setTotalChunks(springAiDocs.size());
            documentRepository.save(document);
            log.info("Hoàn thành xử lý Document ID: {}. Tổng số chunks đã lưu: {}", documentId, springAiDocs.size());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý Document ID: {}", documentId, e);
            document.setStatus("FAILED");
            document.setErrorMessage(e.getMessage());
            documentRepository.save(document);
        }
    }
}
