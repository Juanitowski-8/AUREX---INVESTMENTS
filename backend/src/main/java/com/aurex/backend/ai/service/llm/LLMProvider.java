package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.dto.PortfolioAnalysisContext;

public interface LLMProvider {

    String getProviderName();

    LLMAnalysisResult generateAnalysis(PortfolioAnalysisContext context);
}
