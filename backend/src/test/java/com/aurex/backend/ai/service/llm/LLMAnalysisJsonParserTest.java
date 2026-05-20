package com.aurex.backend.ai.service.llm;

import static org.assertj.core.api.Assertions.assertThat;

import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class LLMAnalysisJsonParserTest {

    private final LLMAnalysisJsonParser parser = new LLMAnalysisJsonParser(new ObjectMapper());

    @Test
    void parsesStructuredJson() {
        String json =
                """
                {
                  "summary": "Educational snapshot of simulated holdings.",
                  "riskLevel": "Moderate",
                  "concentrationNotes": "BTC is the largest weight.",
                  "observations": ["Allocation is concentrated.", "P/L is educational only."],
                  "disclaimer": "Educational insights only. Not financial advice."
                }
                """;

        var result = parser.parse(json);

        assertThat(result.summary()).contains("Educational");
        assertThat(result.riskLevel()).isEqualTo(AnalysisRiskLevel.Moderate);
        assertThat(result.observations()).hasSize(2);
    }
}
