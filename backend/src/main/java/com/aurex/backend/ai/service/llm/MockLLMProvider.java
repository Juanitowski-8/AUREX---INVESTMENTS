package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.dto.PortfolioAnalysisContext;
import com.aurex.backend.ai.service.MockAIAnalysisGenerator;
import com.aurex.backend.portfolio.dto.AllocationResponse;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MockLLMProvider implements LLMProvider {

    private final MockAIAnalysisGenerator mockAIAnalysisGenerator;

    public MockLLMProvider(MockAIAnalysisGenerator mockAIAnalysisGenerator) {
        this.mockAIAnalysisGenerator = mockAIAnalysisGenerator;
    }

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    @Override
    public LLMAnalysisResult generateAnalysis(PortfolioAnalysisContext context) {
        MockAIAnalysisGenerator.GeneratedAnalysis generated =
                mockAIAnalysisGenerator.generate(toSummary(context));
        return new LLMAnalysisResult(
                generated.summary(),
                generated.riskLevel(),
                generated.concentrationNotes(),
                generated.observations(),
                generated.disclaimer());
    }

    private static PortfolioSummaryResponse toSummary(PortfolioAnalysisContext context) {
        List<AllocationResponse> allocation =
                context.allocation().stream()
                        .map(a -> new AllocationResponse(a.symbol(), null, a.percentage()))
                        .toList();

        return new PortfolioSummaryResponse(
                null,
                context.portfolioName(),
                context.baseCurrency(),
                context.totalValue(),
                null,
                context.totalPnL(),
                context.totalPnLPercentage(),
                context.bestAsset(),
                context.worstAsset(),
                context.riskLevel(),
                allocation,
                null);
    }
}
