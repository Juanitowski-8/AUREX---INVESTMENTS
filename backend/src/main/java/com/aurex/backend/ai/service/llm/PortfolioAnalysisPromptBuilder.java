package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.PortfolioAnalysisContext;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PortfolioAnalysisPromptBuilder {

    public static final String SYSTEM_PROMPT =
            """
            You are an educational financial analysis assistant for a simulated portfolio intelligence platform. \
            You do not provide financial advice, trading instructions, buy/sell recommendations, or guarantees. \
            You only explain portfolio metrics, risk concentration, allocation, volatility signals and educational observations.

            Respond with valid JSON only, matching this schema:
            {
              "summary": "string (2-4 sentences, educational tone)",
              "riskLevel": "Low | Moderate | High",
              "concentrationNotes": "string",
              "observations": ["string", "..."],
              "disclaimer": "Educational insights only. Not financial advice."
            }

            Rules:
            - Never tell the user to buy, sell, or hold any asset.
            - Never provide personalized financial advice.
            - Use only the portfolio metrics supplied in the user message.
            - Keep observations to 3-5 bullet-style strings.
            """;

    private final ObjectMapper objectMapper;

    public String buildUserPrompt(PortfolioAnalysisContext context, int maxChars) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("baseCurrency", context.baseCurrency());
        payload.put("totalValue", context.totalValue());
        payload.put("totalPnL", context.totalPnL());
        payload.put("totalPnLPercentage", context.totalPnLPercentage());
        payload.put("riskLevel", context.riskLevel());
        payload.put("holdingSymbols", context.holdingSymbols());
        payload.put(
                "allocation",
                context.allocation().stream()
                        .map(a -> a.symbol() + ":" + a.percentage() + "%")
                        .collect(Collectors.toList()));
        if (context.bestAsset() != null) {
            payload.put("bestAsset", context.bestAsset().symbol() + ":" + context.bestAsset().pnlPercentage() + "%");
        }
        if (context.worstAsset() != null) {
            payload.put("worstAsset", context.worstAsset().symbol() + ":" + context.worstAsset().pnlPercentage() + "%");
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to build LLM user prompt", ex);
        }

        String prompt =
                "Analyze this simulated portfolio for educational purposes. Metrics JSON:\n" + json;
        if (prompt.length() <= maxChars) {
            return prompt;
        }
        return prompt.substring(0, maxChars);
    }
}
