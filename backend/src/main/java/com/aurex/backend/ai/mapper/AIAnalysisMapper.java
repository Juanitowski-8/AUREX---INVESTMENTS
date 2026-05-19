package com.aurex.backend.ai.mapper;

import com.aurex.backend.ai.dto.AIAnalysisResponse;
import com.aurex.backend.ai.entity.AIAnalysis;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AIAnalysisMapper {

    private final ObjectMapper objectMapper;

    public AIAnalysisResponse toResponse(AIAnalysis analysis) {
        return new AIAnalysisResponse(
                analysis.getId(),
                analysis.getPortfolio().getId(),
                analysis.getSummary(),
                analysis.getRiskLevel(),
                analysis.getConcentrationNotes(),
                parseObservations(analysis.getObservations()),
                analysis.getDisclaimer(),
                analysis.getCreatedAt());
    }

    public String serializeObservations(List<String> observations) {
        try {
            return objectMapper.writeValueAsString(observations);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize observations", ex);
        }
    }

    private List<String> parseObservations(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse observations", ex);
        }
    }
}
