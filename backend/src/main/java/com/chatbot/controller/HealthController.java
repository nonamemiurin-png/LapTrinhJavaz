package com.chatbot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }
}
