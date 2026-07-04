package com.chatbot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatasetGeneratorService {

    private final JdbcTemplate jdbcTemplate;
    private final ChatClient chatClient;

    private static final String GENERATOR_PROMPT = """
            Bạn là một chuyên gia tạo dữ liệu huấn luyện (fine-tuning data).
            Dựa vào đoạn tài liệu sau đây, hãy tạo ra 3 cặp câu hỏi và câu trả lời mang tính học thuật dành cho sinh viên đại học.
            Yêu cầu:
            1. Câu hỏi phải đa dạng (hỏi khái niệm, hỏi so sánh, hỏi nguyên nhân).
            2. Trả về đúng định dạng JSON Array, mỗi object có 2 trường là "prompt" và "completion".
            3. KHÔNG trả về markdown, chỉ trả về JSON thuần túy.
            
            TÀI LIỆU:
            {context}
            """;

    public String generateJsonlDataset() {
        log.info("Bắt đầu sinh dataset từ PostgreSQL vector_store...");
        
        // Retrieve up to 10 chunks from PostgreSQL vector_store table directly
        List<String> chunks;
        try {
            chunks = jdbcTemplate.queryForList("SELECT content FROM vector_store LIMIT 10", String.class);
        } catch (Exception e) {
            log.error("Không thể đọc từ bảng vector_store", e);
            return "Lỗi khi truy cập bảng vector_store: " + e.getMessage();
        }
        
        if (chunks.isEmpty()) {
            return "Không tìm thấy tài liệu hay chunk nào trong cơ sở dữ liệu để sinh dataset.";
        }

        String fileName = "training-dataset.jsonl";
        int totalPairs = 0;

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
            for (String chunkContent : chunks) {
                SystemPromptTemplate promptTemplate = new SystemPromptTemplate(GENERATOR_PROMPT);
                Prompt prompt = promptTemplate.create(Map.of("context", chunkContent));
                
                String jsonResponse = chatClient.prompt(prompt).call().content();
                
                jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();
                
                String[] items = jsonResponse.split("},");
                for (String item : items) {
                    String cleanItem = item.replace("[", "").replace("]", "").trim();
                    if (!cleanItem.endsWith("}")) {
                        cleanItem += "}";
                    }
                    writer.write(cleanItem);
                    writer.newLine();
                    totalPairs++;
                }
            }
            log.info("Đã sinh xong dataset với {} cặp câu hỏi vào file {}", totalPairs, fileName);
            return "Đã sinh thành công " + totalPairs + " cặp dữ liệu huấn luyện tại file " + fileName;
        } catch (IOException e) {
            log.error("Lỗi ghi file dataset", e);
            return "Lỗi khi tạo file dataset: " + e.getMessage();
        }
    }
}
