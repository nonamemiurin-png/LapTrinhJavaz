package com.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableAsync
public class ChatbotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
