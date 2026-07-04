package com.chatbot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationService {

    private final ChatClient chatClient;

    private static final String JUDGE_PROMPT = """
            Bạn là một chuyên gia chấm điểm độc lập (LLM-as-a-judge). Nhiệm vụ của bạn là đánh giá câu trả lời của 2 mô hình AI khác nhau.
            Câu hỏi: {question}
            
            Câu trả lời 1 (RAG): {rag_answer}
            Câu trả lời 2 (Fine-Tuned): {ft_answer}
            
            Hãy chấm điểm 2 câu trả lời trên theo thang điểm 10 dựa trên các tiêu chí:
            1. Độ chính xác thông tin.
            2. Sự tự nhiên và mạch lạc.
            
            Hãy trả về kết quả định dạng như sau:
            ĐIỂM RAG: [điểm]
            ĐIỂM FINE-TUNED: [điểm]
            NHẬN XÉT: [Nhận xét chi tiết của bạn so sánh 2 phương pháp]
            """;

    public String evaluateAndScore(String question, String ragAnswer, String ftAnswer) {
        log.info("Evaluating responses for question: {}", question);

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(JUDGE_PROMPT);
        Prompt prompt = systemPromptTemplate.create(Map.of(
                "question", question,
                "rag_answer", ragAnswer,
                "ft_answer", ftAnswer
        ));

        return chatClient.prompt(prompt)
                .call()
                .content();
    }
}
