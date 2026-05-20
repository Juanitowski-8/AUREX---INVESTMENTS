package com.aurex.backend.ai.service.llm;

import static org.assertj.core.api.Assertions.assertThat;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import java.util.List;
import org.junit.jupiter.api.Test;

class LLMResponseValidatorTest {

    private final LLMResponseValidator validator = new LLMResponseValidator();

    @Test
    void acceptsEducationalContent() {
        LLMAnalysisResult result =
                new LLMAnalysisResult(
                        "Educational overview of allocation and simulated P/L.",
                        AnalysisRiskLevel.Moderate,
                        "BTC represents a large share of value.",
                        List.of("Diversification may reduce concentration in simulations."),
                        "Educational insights only. Not financial advice.");

        assertThat(validator.isAcceptable(result)).isTrue();
        assertThat(validator.enforceDisclaimer(result).disclaimer())
                .isEqualTo("Educational insights only. Not financial advice.");
    }

    @Test
    void rejectsBuyRecommendations() {
        LLMAnalysisResult result =
                new LLMAnalysisResult(
                        "You should buy BTC now for better returns.",
                        AnalysisRiskLevel.High,
                        "Notes",
                        List.of("Observation"),
                        "Educational insights only. Not financial advice.");

        assertThat(validator.isAcceptable(result)).isFalse();
    }
}
