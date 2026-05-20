package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.dto.PortfolioAnalysisContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class FallbackLLMProvider implements LLMProvider {

    private final LLMProvider primary;
    private final MockLLMProvider fallback;
    private final LLMResponseValidator responseValidator;

    @Override
    public String getProviderName() {
        return primary.getProviderName() + "+MOCK";
    }

    @Override
    public LLMAnalysisResult generateAnalysis(PortfolioAnalysisContext context) {
        try {
            LLMAnalysisResult result = primary.generateAnalysis(context);
            LLMAnalysisResult safe = responseValidator.enforceDisclaimer(result);
            if (responseValidator.isAcceptable(safe)) {
                return safe;
            }
            log.warn(
                    "Primary LLM provider {} returned unacceptable content; using mock fallback",
                    primary.getProviderName());
        } catch (Exception ex) {
            log.warn(
                    "Primary LLM provider {} failed ({}); using mock fallback",
                    primary.getProviderName(),
                    ex.getMessage());
        }
        return fallback.generateAnalysis(context);
    }
}
