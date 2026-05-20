package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.dto.LLMAnalysisResult;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class LLMResponseValidator {

    private static final String REQUIRED_DISCLAIMER = "Educational insights only. Not financial advice.";

    private static final List<Pattern> PROHIBITED_PATTERNS =
            List.of(
                    Pattern.compile("\\b(you should|we recommend|i recommend)\\s+(buy|sell|purchase)\\b", Pattern.CASE_INSENSITIVE),
                    Pattern.compile("\\b(buy|sell)\\s+now\\b", Pattern.CASE_INSENSITIVE),
                    Pattern.compile("\\bstrong\\s+buy\\b", Pattern.CASE_INSENSITIVE));

    public boolean isAcceptable(LLMAnalysisResult result) {
        if (result == null
                || result.summary() == null
                || result.summary().isBlank()
                || result.riskLevel() == null
                || result.observations() == null
                || result.observations().isEmpty()) {
            return false;
        }

        String combined = combineText(result);
        return PROHIBITED_PATTERNS.stream().noneMatch(p -> p.matcher(combined).find());
    }

    public LLMAnalysisResult enforceDisclaimer(LLMAnalysisResult result) {
        return new LLMAnalysisResult(
                result.summary(),
                result.riskLevel(),
                result.concentrationNotes(),
                result.observations(),
                REQUIRED_DISCLAIMER);
    }

    private static String combineText(LLMAnalysisResult result) {
        StringBuilder sb = new StringBuilder(result.summary());
        if (result.concentrationNotes() != null) {
            sb.append(' ').append(result.concentrationNotes());
        }
        result.observations().forEach(o -> sb.append(' ').append(o));
        return sb.toString();
    }
}
