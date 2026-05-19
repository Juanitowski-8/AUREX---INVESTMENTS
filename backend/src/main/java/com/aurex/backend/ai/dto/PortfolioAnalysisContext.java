package com.aurex.backend.ai.dto;

import com.aurex.backend.portfolio.dto.AllocationResponse;
import com.aurex.backend.portfolio.dto.AssetPerformanceResponse;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import java.math.BigDecimal;
import java.util.List;

/** Sanitized portfolio metrics safe to include in an LLM prompt (no PII). */
public record PortfolioAnalysisContext(
        String portfolioName,
        String baseCurrency,
        BigDecimal totalValue,
        BigDecimal totalPnL,
        BigDecimal totalPnLPercentage,
        String riskLevel,
        List<String> holdingSymbols,
        List<AllocationSnapshot> allocation,
        AssetPerformanceResponse bestAsset,
        AssetPerformanceResponse worstAsset) {

    public record AllocationSnapshot(String symbol, BigDecimal percentage) {}

    public static PortfolioAnalysisContext from(PortfolioSummaryResponse summary) {
        List<String> symbols =
                summary.allocation() == null
                        ? List.of()
                        : summary.allocation().stream().map(AllocationResponse::symbol).toList();

        List<AllocationSnapshot> allocationSnapshots =
                summary.allocation() == null
                        ? List.of()
                        : summary.allocation().stream()
                                .map(a -> new AllocationSnapshot(a.symbol(), a.percentage()))
                                .toList();

        return new PortfolioAnalysisContext(
                summary.name(),
                summary.baseCurrency(),
                summary.totalValue(),
                summary.totalPnL(),
                summary.totalPnLPercentage(),
                summary.riskLevel(),
                symbols,
                allocationSnapshots,
                summary.bestAsset(),
                summary.worstAsset());
    }
}
