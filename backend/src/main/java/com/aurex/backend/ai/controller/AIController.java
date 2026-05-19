package com.aurex.backend.ai.controller;

import com.aurex.backend.ai.dto.AIAnalysisResponse;
import com.aurex.backend.ai.service.AIAnalysisService;
import com.aurex.backend.common.response.ApiResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIAnalysisService aiAnalysisService;

    @PostMapping("/portfolio-summary/{portfolioId}")
    public ResponseEntity<ApiResponse<AIAnalysisResponse>> generatePortfolioSummary(
            @PathVariable UUID portfolioId) {
        AIAnalysisResponse response = aiAnalysisService.generatePortfolioSummary(portfolioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping("/analyses")
    public ResponseEntity<ApiResponse<List<AIAnalysisResponse>>> listAnalyses() {
        return ResponseEntity.ok(ApiResponse.ok(aiAnalysisService.listForCurrentUser()));
    }

    @GetMapping("/analyses/{id}")
    public ResponseEntity<ApiResponse<AIAnalysisResponse>> getAnalysis(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(aiAnalysisService.getById(id)));
    }
}
