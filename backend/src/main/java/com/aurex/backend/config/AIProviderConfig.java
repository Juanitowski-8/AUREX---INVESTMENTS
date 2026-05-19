package com.aurex.backend.config;

import com.aurex.backend.ai.service.llm.FallbackLLMProvider;
import com.aurex.backend.ai.service.llm.LLMProvider;
import com.aurex.backend.ai.service.llm.LLMResponseValidator;
import com.aurex.backend.ai.service.llm.MockLLMProvider;
import com.aurex.backend.ai.service.llm.AnthropicLLMProvider;
import com.aurex.backend.ai.service.llm.OpenAILLMProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

@Configuration
public class AIProviderConfig {

    @Bean
    @Primary
    public LLMProvider llmProvider(
            AiProperties aiProperties,
            MockLLMProvider mockLLMProvider,
            OpenAILLMProvider openAILLMProvider,
            AnthropicLLMProvider anthropicLLMProvider,
            LLMResponseValidator responseValidator) {

        String provider = aiProperties.getProvider();

        if ("openai".equalsIgnoreCase(provider)
                && StringUtils.hasText(aiProperties.getOpenai().getApiKey())) {
            return new FallbackLLMProvider(openAILLMProvider, mockLLMProvider, responseValidator);
        }

        if ("anthropic".equalsIgnoreCase(provider)
                && StringUtils.hasText(aiProperties.getAnthropic().getApiKey())) {
            return new FallbackLLMProvider(anthropicLLMProvider, mockLLMProvider, responseValidator);
        }

        return mockLLMProvider;
    }
}
