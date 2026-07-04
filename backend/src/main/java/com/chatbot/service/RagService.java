package com.chatbot.service;

import com.chatbot.dto.ChatResponse;
import com.chatbot.dto.Citation;
import com.chatbot.entity.Document;
import com.chatbot.entity.Metric;
import com.chatbot.repository.DocumentRepository;
import com.chatbot.repository.MetricRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;
    private final ChatMemory chatMemory;
    private final ChatHistoryService chatHistoryService;
    private final MetricRepository metricRepository;

    public RagService(ChatClient.Builder chatClientBuilder, 
                      VectorStore vectorStore,
                      DocumentRepository documentRepository,
                      ChatHistoryService chatHistoryService,
                      MetricRepository metricRepository) {
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;
        this.chatHistoryService = chatHistoryService;
        this.metricRepository = metricRepository;
        this.chatMemory = MessageWindowChatMemory.builder().build();
        this.chatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    private static final String SYSTEM_PROMPT = """
            Bạn là một trợ lý AI hữu ích được thiết kế để giúp sinh viên học tập.
            Bạn sẽ trả lời câu hỏi của sinh viên dựa MỘT CÁCH NGHIÊM NGẶT vào các tài liệu được cung cấp dưới đây.
            Nếu bạn không biết câu trả lời từ tài liệu, hãy nói "Tôi không tìm thấy thông tin này trong tài liệu môn học." Không được tự bịa ra câu trả lời.
            
            TÀI LIỆU:
            {documents}
            """;

    private static final String OUT_OF_SCOPE_ANSWER =
            "Tôi không tìm thấy thông tin này trong tài liệu môn học.";

    public ChatResponse generateAnswer(String query, String sessionId) {
        return generateAnswer(query, sessionId, null);
    }

    public ChatResponse generateAnswer(String query, String sessionId, String subject) {
        long startedAt = System.nanoTime();
        log.info("Received RAG query: {} for session: {}", query, sessionId);
        
        String resolvedSessionId = (sessionId != null && !sessionId.isEmpty()) ? sessionId : "default-session";
        chatHistoryService.record(resolvedSessionId, "USER", query, "RAG");

        // 1. Tìm kiếm context bằng Spring AI VectorStore
        SearchRequest.Builder searchBuilder = SearchRequest.builder().query(query).topK(3);
        if (subject != null && !subject.isBlank()) {
            var filter = new FilterExpressionBuilder().eq("subject", subject.trim()).build();
            searchBuilder.filterExpression(filter);
        }
        SearchRequest searchRequest = searchBuilder.build();
        List<org.springframework.ai.document.Document> similarDocs = vectorStore.similaritySearch(searchRequest);

        if (similarDocs == null || similarDocs.isEmpty()) {
            chatHistoryService.record(resolvedSessionId, "ASSISTANT", OUT_OF_SCOPE_ANSWER, "RAG");
            metricRepository.save(Metric.builder()
                    .model("RAG")
                    .latencyMs((System.nanoTime() - startedAt) / 1_000_000)
                    .recordedAt(LocalDateTime.now())
                    .build());
            return ChatResponse.builder()
                    .answer(OUT_OF_SCOPE_ANSWER)
                    .mode("RAG")
                    .sources(List.of())
                    .citations(List.of())
                    .build();
        }
        
        String documentsContext = similarDocs.stream()
                .map(doc -> Objects.requireNonNullElse(doc.getText(), ""))
                .collect(Collectors.joining("\n\n---\n\n"));
                 
        // 2. Truy xuất tên tài liệu để làm citations (nguồn)
        List<String> sources = similarDocs.stream()
                .map(doc -> {
                    // Extract documentId from metadata which was inserted during parsing
                    Object docIdObj = doc.getMetadata().get("documentId");
                    if (docIdObj != null) {
                        try {
                            Long docId = Long.parseLong(docIdObj.toString());
                            Document dbDoc = documentRepository.findById(docId).orElse(null);
                            return dbDoc != null ? dbDoc.getFilename() : "Tài liệu không xác định";
                        } catch (NumberFormatException e) {
                            return "Tài liệu không xác định";
                        }
                    }
                    return "Tài liệu không xác định";
                })
                .distinct()
                .collect(Collectors.toList());

        List<Citation> citations = similarDocs.stream()
                .map(doc -> Citation.builder()
                        .filename(String.valueOf(doc.getMetadata().getOrDefault("filename", "Tài liệu không xác định")))
                        .subject(String.valueOf(doc.getMetadata().getOrDefault("subject", "")))
                        .chapter(String.valueOf(doc.getMetadata().getOrDefault("chapter", "")))
                        .chunkId(doc.getId())
                        .excerpt(Objects.requireNonNullElse(doc.getText(), ""))
                        .build())
                .collect(Collectors.toMap(
                        citation -> citation.getFilename() + "|" + citation.getChapter() + "|" + citation.getChunkId(),
                        citation -> citation,
                        (first, ignored) -> first
                ))
                .values().stream().toList();

        // 3. Xây dựng Prompt
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_PROMPT);
        var systemMessage = systemPromptTemplate.createMessage(Map.of("documents", documentsContext));

        // 4. Gọi LLM sinh câu trả lời
        String answer = chatClient.prompt()
                .messages(systemMessage, new UserMessage(query))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, resolvedSessionId))
                .call()
                .content();

        if (answer == null || answer.isBlank()) {
            answer = OUT_OF_SCOPE_ANSWER;
        }
        chatHistoryService.record(resolvedSessionId, "ASSISTANT", answer, "RAG");
        metricRepository.save(Metric.builder()
                .model("RAG")
                .latencyMs((System.nanoTime() - startedAt) / 1_000_000)
                .recordedAt(LocalDateTime.now())
                .build());

        return ChatResponse.builder()
                .answer(answer)
                .mode("RAG")
                .sources(sources)
                .citations(citations)
                .build();
    }
}
