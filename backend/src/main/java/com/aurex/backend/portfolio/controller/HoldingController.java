package com.aurex.backend.portfolio.controller;

import com.aurex.backend.common.response.ApiResponse;
import com.aurex.backend.portfolio.dto.HoldingResponse;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.service.HoldingService;
import com.aurex.backend.portfolio.service.PortfolioService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/holdings")
@RequiredArgsConstructor
public class HoldingController {

    private final PortfolioService portfolioService;
    private final HoldingService holdingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HoldingResponse>>> list(@PathVariable UUID portfolioId) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(portfolioId);
        return ResponseEntity.ok(ApiResponse.ok(holdingService.listByPortfolio(portfolio)));
    }
}
