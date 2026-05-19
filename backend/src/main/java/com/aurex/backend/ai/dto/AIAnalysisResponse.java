package com.aurex.backend.ai.dto;

import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AIAnalysisResponse(
        UUID id,
        UUID portfolioId,
        String summary,
        AnalysisRiskLevel riskLevel,
        String concentrationNotes,
        List<String> observations,
        String disclaimer,
        Instant createdAt) {}
