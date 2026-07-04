package com.chatbot.controller;

import com.chatbot.entity.Document;
import com.chatbot.repository.DocumentRepository;
import com.chatbot.service.DocumentProcessingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DocumentControllerTest {

    private final DocumentRepository repository = mock(DocumentRepository.class);
    private final DocumentProcessingService processingService = mock(DocumentProcessingService.class);
    private final DocumentController controller = new DocumentController(repository, processingService);

    @Test
    void rejectsUnsupportedFileType() {
        var file = new MockMultipartFile("file", "malware.exe", "application/octet-stream", new byte[]{1});

        var response = controller.uploadDocument(file, "CTDL", "Chương 1", "fixed");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deleteRemovesVectorsFileAndMetadata(@TempDir Path tempDir) throws Exception {
        Path uploadedFile = Files.writeString(tempDir.resolve("document.txt"), "content");
        Document document = Document.builder()
                .id(7L)
                .filename("document.txt")
                .filePath(uploadedFile.toString())
                .build();
        when(repository.findById(7L)).thenReturn(Optional.of(document));

        var response = controller.deleteDocument(7L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(processingService).deleteVectors(7L);
        verify(repository).delete(document);
        assertFalse(Files.exists(uploadedFile));
    }
}
