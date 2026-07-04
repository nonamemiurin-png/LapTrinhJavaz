package com.chatbot.controller;

import com.chatbot.entity.Document;
import com.chatbot.repository.DocumentRepository;
import com.chatbot.service.DocumentProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "pptx", "txt");
    private static final Set<String> CHUNK_STRATEGIES = Set.of("fixed", "semantic", "hierarchical");

    private final DocumentRepository documentRepository;
    private final DocumentProcessingService documentProcessingService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
                                             @RequestParam(defaultValue = "Nhập môn AI") String subject,
                                             @RequestParam(defaultValue = "Chưa phân chương") String chapter,
                                             @RequestParam(defaultValue = "fixed") String chunkStrategy) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body("Chỉ hỗ trợ PDF, DOCX, PPTX và TXT");
        }
        String normalizedStrategy = chunkStrategy.trim().toLowerCase();
        if (!CHUNK_STRATEGIES.contains(normalizedStrategy)) {
            return ResponseEntity.badRequest().body("Chunking strategy phải là fixed, semantic hoặc hierarchical");
        }

        try {
            // 1. Create uploads folder if it doesn't exist
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 2. Save file to disk
            String fileUuid = UUID.randomUUID().toString();
            String safeFilename = new File(originalFilename == null ? "document." + extension : originalFilename).getName();
            String savedFilename = fileUuid + "_" + safeFilename;
            String savedPath = uploadDir + File.separator + savedFilename;
            
            file.transferTo(new File(savedPath));

            // 3. Save metadata to MySQL with PENDING status
            Document document = Document.builder()
                    .filename(originalFilename)
                    .filePath(savedPath)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .subject(subject.trim())
                    .chapter(chapter.trim())
                    .chunkStrategy(normalizedStrategy)
                    .uploadedAt(LocalDateTime.now())
                    .status("PENDING")
                    .build();

            Document savedDocument = documentRepository.save(Objects.requireNonNull(document));

            // 4. Trigger asynchronous processing
            documentProcessingService.processDocument(Objects.requireNonNull(savedDocument.getId()));

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(savedDocument);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Document> listDocuments() {
        return documentRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        return documentRepository.findById(Objects.requireNonNull(id)).map(document -> {
            documentProcessingService.deleteVectors(id);
            documentRepository.delete(Objects.requireNonNull(document));
            try {
                java.nio.file.Files.deleteIfExists(java.nio.file.Path.of(document.getFilePath()));
            } catch (IOException ignored) {
                // Metadata is removed even when the uploaded file was already missing.
            }
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reindex")
    public ResponseEntity<?> reindexDocument(@PathVariable Long id,
                                              @RequestParam(defaultValue = "fixed") String chunkStrategy) {
        String normalizedStrategy = chunkStrategy.trim().toLowerCase();
        if (!CHUNK_STRATEGIES.contains(normalizedStrategy)) {
            return ResponseEntity.badRequest().body("Chunking strategy phải là fixed, semantic hoặc hierarchical");
        }
        return documentRepository.findById(Objects.requireNonNull(id)).map(document -> {
            documentProcessingService.deleteVectors(id);
            document.setChunkStrategy(normalizedStrategy);
            document.setStatus("PENDING");
            document.setTotalChunks(null);
            document.setErrorMessage(null);
            Document saved = documentRepository.save(Objects.requireNonNull(document));
            documentProcessingService.processDocument(id);
            return ResponseEntity.accepted().body(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
