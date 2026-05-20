package com.aurex.backend.portfolio.service;

import com.aurex.backend.market.dto.ResolvedPrice;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.service.MarketDataService;
import com.aurex.backend.portfolio.dto.AllocationResponse;
import com.aurex.backend.portfolio.dto.AssetPerformanceResponse;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import com.aurex.backend.portfolio.entity.Holding;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.repository.HoldingRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioSummaryService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal RISK_HIGH_THRESHOLD = new BigDecimal("60");
    private static final BigDecimal RISK_MODERATE_THRESHOLD = new BigDecimal("35");
    private static final int MONEY_SCALE = 2;
    private static final int PERCENT_SCALE = 1;

    private final PortfolioService portfolioService;
    private final HoldingRepository holdingRepository;
    private final MarketDataService marketDataService;

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getSummary(UUID portfolioId) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(portfolioId);
        List<Holding> holdings =
                holdingRepository.findByPortfolioIdWithAssetOrderByAssetSymbolAsc(portfolio.getId());

        if (holdings.isEmpty()) {
            return emptySummary(portfolio);
        }

        List<HoldingMetrics> metrics = new ArrayList<>();
        Instant latestPriceTime = Instant.EPOCH;

        for (Holding holding : holdings) {
            Asset asset = holding.getAsset();
            BigDecimal quantity = holding.getQuantity();
            BigDecimal averageBuyPrice = holding.getAverageBuyPrice();
            BigDecimal costBasis = quantity.multiply(averageBuyPrice);

            ResolvedPrice resolved =
                    marketDataService.resolveCurrentPrice(asset, averageBuyPrice);
            if (resolved.asOf().isAfter(latestPriceTime)) {
                latestPriceTime = resolved.asOf();
            }

            BigDecimal marketValue = quantity.multiply(resolved.price());
            BigDecimal pnl = marketValue.subtract(costBasis);
            BigDecimal pnlPercentage =
                    costBasis.compareTo(BigDecimal.ZERO) > 0
                            ? pnl.multiply(HUNDRED)
                                    .divide(costBasis, 8, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

            metrics.add(
                    new HoldingMetrics(
                            asset.getSymbol(), costBasis, marketValue, pnl, pnlPercentage));
        }

        BigDecimal totalCost =
                metrics.stream()
                        .map(HoldingMetrics::costBasis)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalValue =
                metrics.stream()
                        .map(HoldingMetrics::marketValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPnL = totalValue.subtract(totalCost);
        BigDecimal totalPnLPercentage = percentageOf(totalPnL, totalCost);

        List<AllocationResponse> allocation = buildAllocation(metrics, totalValue);
        AssetPerformanceResponse bestAsset = findBest(metrics);
        AssetPerformanceResponse worstAsset = findWorst(metrics);
        String riskLevel = resolveRiskLevel(allocation);

        return new PortfolioSummaryResponse(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getBaseCurrency(),
                scaleMoney(totalValue),
                scaleMoney(totalCost),
                scaleMoney(totalPnL),
                scalePercent(totalPnLPercentage),
                bestAsset,
                worstAsset,
                riskLevel,
                allocation,
                latestPriceTime.equals(Instant.EPOCH) ? Instant.now() : latestPriceTime);
    }

    private PortfolioSummaryResponse emptySummary(Portfolio portfolio) {
        return new PortfolioSummaryResponse(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getBaseCurrency(),
                scaleMoney(BigDecimal.ZERO),
                scaleMoney(BigDecimal.ZERO),
                scaleMoney(BigDecimal.ZERO),
                scalePercent(BigDecimal.ZERO),
                null,
                null,
                "Low",
                List.of(),
                Instant.now());
    }

    private List<AllocationResponse> buildAllocation(
            List<HoldingMetrics> metrics, BigDecimal totalValue) {
        if (totalValue.compareTo(BigDecimal.ZERO) <= 0) {
            return metrics.stream()
                    .map(
                            m ->
                                    new AllocationResponse(
                                            m.symbol(), scaleMoney(m.marketValue()), scalePercent(BigDecimal.ZERO)))
                    .toList();
        }

        return metrics.stream()
                .sorted(Comparator.comparing(HoldingMetrics::marketValue).reversed())
                .map(
                        m ->
                                new AllocationResponse(
                                        m.symbol(),
                                        scaleMoney(m.marketValue()),
                                        scalePercent(
                                                m.marketValue()
                                                        .multiply(HUNDRED)
                                                        .divide(totalValue, 8, RoundingMode.HALF_UP))))
                .toList();
    }

    private AssetPerformanceResponse findBest(List<HoldingMetrics> metrics) {
        return metrics.stream()
                .max(Comparator.comparing(HoldingMetrics::pnlPercentage))
                .map(m -> new AssetPerformanceResponse(m.symbol(), scalePercent(m.pnlPercentage())))
                .orElse(null);
    }

    private AssetPerformanceResponse findWorst(List<HoldingMetrics> metrics) {
        return metrics.stream()
                .min(Comparator.comparing(HoldingMetrics::pnlPercentage))
                .map(m -> new AssetPerformanceResponse(m.symbol(), scalePercent(m.pnlPercentage())))
                .orElse(null);
    }

    private String resolveRiskLevel(List<AllocationResponse> allocation) {
        BigDecimal maxWeight =
                allocation.stream()
                        .map(AllocationResponse::percentage)
                        .max(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);

        if (maxWeight.compareTo(RISK_HIGH_THRESHOLD) > 0) {
            return "High";
        }
        if (maxWeight.compareTo(RISK_MODERATE_THRESHOLD) > 0) {
            return "Moderate";
        }
        return "Low";
    }

    private static BigDecimal percentageOf(BigDecimal part, BigDecimal whole) {
        if (whole.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return part.multiply(HUNDRED).divide(whole, 8, RoundingMode.HALF_UP);
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private static BigDecimal scalePercent(BigDecimal value) {
        return value.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
    }

    private record HoldingMetrics(
            String symbol,
            BigDecimal costBasis,
            BigDecimal marketValue,
            BigDecimal pnl,
            BigDecimal pnlPercentage) {}
}
