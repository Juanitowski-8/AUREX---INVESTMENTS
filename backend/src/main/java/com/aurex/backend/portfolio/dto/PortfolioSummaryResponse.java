package com.aurex.backend.portfolio.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PortfolioSummaryResponse(
        UUID portfolioId,
        String name,
        String baseCurrency,
        BigDecimal totalValue,
        BigDecimal totalCost,
        BigDecimal totalPnL,
        BigDecimal totalPnLPercentage,
        AssetPerformanceResponse bestAsset,
        AssetPerformanceResponse worstAsset,
        String riskLevel,
        List<AllocationResponse> allocation,
        Instant updatedAt) {}
