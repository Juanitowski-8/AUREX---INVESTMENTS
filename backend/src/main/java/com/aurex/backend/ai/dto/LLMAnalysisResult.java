package com.aurex.backend.ai.dto;

import com.aurex.backend.ai.entity.AnalysisRiskLevel;
import java.util.List;

public record LLMAnalysisResult(
        String summary,
        AnalysisRiskLevel riskLevel,
        String concentrationNotes,
        List<String> observations,
        String disclaimer) {}
