package com.aurex.backend.ai.service;

import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import com.aurex.backend.portfolio.dto.AllocationResponse;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MockAIAnalysisGenerator {

    private static final String DISCLAIMER =
            "Educational insights only. Not financial advice.";

    public GeneratedAnalysis generate(PortfolioSummaryResponse summary) {
        AnalysisRiskLevel riskLevel = mapRiskLevel(summary.riskLevel());
        String summaryText = buildSummaryText(summary);
        String concentrationNotes = buildConcentrationNotes(summary);
        List<String> observations = buildObservations(summary);

        return new GeneratedAnalysis(summaryText, riskLevel, concentrationNotes, observations, DISCLAIMER);
    }

    private static AnalysisRiskLevel mapRiskLevel(String riskLevel) {
        if (riskLevel == null) {
            return AnalysisRiskLevel.Low;
        }
        return switch (riskLevel) {
            case "High" -> AnalysisRiskLevel.High;
            case "Moderate" -> AnalysisRiskLevel.Moderate;
            default -> AnalysisRiskLevel.Low;
        };
    }

    private static String buildSummaryText(PortfolioSummaryResponse summary) {
        if (summary.totalValue().compareTo(BigDecimal.ZERO) == 0) {
            return ("Educational overview of \"%s\": this simulated portfolio has no open positions yet. "
                            + "Adding diversified simulated holdings can help you explore how allocation and "
                            + "risk metrics behave over time.")
                    .formatted(summary.name());
        }

        String performanceHint =
                summary.totalPnL().compareTo(BigDecimal.ZERO) >= 0
                        ? "positive simulated performance relative to cost basis"
                        : "a simulated decline relative to cost basis";

        return ("Educational overview of \"%s\" (%s): estimated simulated value %s %s with %s "
                        + "(%s%% vs. cost basis). This is a learning snapshot, not a trading recommendation.")
                .formatted(
                        summary.name(),
                        summary.baseCurrency(),
                        summary.totalValue(),
                        summary.baseCurrency(),
                        performanceHint,
                        summary.totalPnLPercentage());
    }

    private static String buildConcentrationNotes(PortfolioSummaryResponse summary) {
        List<AllocationResponse> allocation = summary.allocation();
        if (allocation == null || allocation.isEmpty()) {
            return "No concentration data is available because the portfolio has no holdings.";
        }

        AllocationResponse top = allocation.getFirst();
        if (allocation.size() == 1) {
            return ("All simulated exposure is concentrated in %s (about %s%% of portfolio value). "
                            + "Single-asset portfolios can show higher volatility in educational models.")
                    .formatted(top.symbol(), top.percentage());
        }

        AllocationResponse second = allocation.get(1);
        return ("Largest simulated weights: %s (~%s%%) and %s (~%s%%). "
                        + "Concentration can amplify swings when a few assets drive most of the portfolio value.")
                .formatted(
                        top.symbol(),
                        top.percentage(),
                        second.symbol(),
                        second.percentage());
    }

    private static List<String> buildObservations(PortfolioSummaryResponse summary) {
        List<String> observations = new ArrayList<>();

        List<AllocationResponse> allocation = summary.allocation();
        if (allocation != null && !allocation.isEmpty()) {
            AllocationResponse top = allocation.getFirst();
            if (allocation.size() >= 2) {
                AllocationResponse second = allocation.get(1);
                observations.add(
                        "%s and %s represent a meaningful share of simulated exposure."
                                .formatted(top.symbol(), second.symbol()));
            } else {
                observations.add(
                        "%s represents the primary simulated holding in this portfolio."
                                .formatted(top.symbol()));
            }
        }

        if (summary.totalPnL().compareTo(BigDecimal.ZERO) > 0) {
            observations.add("Portfolio shows positive simulated performance on a cost-basis view.");
        } else if (summary.totalPnL().compareTo(BigDecimal.ZERO) < 0) {
            observations.add(
                    "Portfolio shows negative simulated performance on a cost-basis view — useful for stress-testing assumptions.");
        } else {
            observations.add("Portfolio simulated P/L is flat versus cost basis in this snapshot.");
        }

        if (summary.bestAsset() != null && summary.worstAsset() != null) {
            observations.add(
                    "Among holdings, %s shows the strongest simulated return profile while %s lags in this period."
                            .formatted(summary.bestAsset().symbol(), summary.worstAsset().symbol()));
        }

        observations.add(
                "Diversification across asset types and position sizes may reduce concentration risk in educational simulations.");

        observations.add(
                "These notes describe simulated data for learning purposes and do not suggest any buy, sell, or hold action.");

        return observations;
    }

    public record GeneratedAnalysis(
            String summary,
            AnalysisRiskLevel riskLevel,
            String concentrationNotes,
            List<String> observations,
            String disclaimer) {}
}
