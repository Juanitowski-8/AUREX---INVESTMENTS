package com.aurex.backend.ai.service.llm;

import com.aurex.backend.ai.client.OpenAIChatClient;
import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.dto.PortfolioAnalysisContext;
import com.aurex.backend.config.AiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OpenAILLMProvider implements LLMProvider {

    private static final String PROVIDER_NAME = "OPENAI";

    private final OpenAIChatClient openAIChatClient;
    private final PortfolioAnalysisPromptBuilder promptBuilder;
    private final AiProperties aiProperties;
    private final LLMAnalysisJsonParser jsonParser;

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public LLMAnalysisResult generateAnalysis(PortfolioAnalysisContext context) {
        String userPrompt =
                promptBuilder.buildUserPrompt(context, aiProperties.getMaxPromptChars());

        String rawJson =
                openAIChatClient.completeJson(PortfolioAnalysisPromptBuilder.SYSTEM_PROMPT, userPrompt);

        return jsonParser.parse(rawJson);
    }
}
