package com.aurex.backend.portfolio.controller;

import com.aurex.backend.common.response.ApiResponse;
import com.aurex.backend.portfolio.dto.PortfolioCreateRequest;
import com.aurex.backend.portfolio.dto.PortfolioResponse;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import com.aurex.backend.portfolio.dto.PortfolioUpdateRequest;
import com.aurex.backend.portfolio.service.PortfolioService;
import com.aurex.backend.portfolio.service.PortfolioSummaryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PortfolioSummaryService portfolioSummaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PortfolioResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.listForCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PortfolioResponse>> create(
            @Valid @RequestBody PortfolioCreateRequest request) {
        PortfolioResponse response = portfolioService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getById(id)));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<PortfolioSummaryResponse>> summary(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioSummaryService.getSummary(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PortfolioResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody PortfolioUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        portfolioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
