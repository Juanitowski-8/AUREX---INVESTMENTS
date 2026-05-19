package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LLMAnalysisJsonParser {

    private final ObjectMapper objectMapper;

    public LLMAnalysisResult parse(String rawJson) {
        try {
            String json = stripMarkdownFences(rawJson);
            JsonNode root = objectMapper.readTree(json);

            String summary = root.path("summary").asText(null);
            String concentrationNotes = root.path("concentrationNotes").asText("");
            AnalysisRiskLevel riskLevel = parseRiskLevel(root.path("riskLevel").asText("Low"));

            List<String> observations = new ArrayList<>();
            JsonNode observationsNode = root.path("observations");
            if (observationsNode.isArray()) {
                observationsNode.forEach(node -> {
                    if (node.isTextual() && !node.asText().isBlank()) {
                        observations.add(node.asText());
                    }
                });
            }

            String disclaimer =
                    root.path("disclaimer").asText("Educational insights only. Not financial advice.");

            return new LLMAnalysisResult(summary, riskLevel, concentrationNotes, observations, disclaimer);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse LLM JSON response", ex);
        }
    }

    private static AnalysisRiskLevel parseRiskLevel(String value) {
        if (value == null) {
            return AnalysisRiskLevel.Low;
        }
        return switch (value.trim().toLowerCase()) {
            case "high" -> AnalysisRiskLevel.High;
            case "moderate", "medium" -> AnalysisRiskLevel.Moderate;
            default -> AnalysisRiskLevel.Low;
        };
    }

    private static String stripMarkdownFences(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                return trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return trimmed;
    }
}
