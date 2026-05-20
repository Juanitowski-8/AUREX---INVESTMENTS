package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.ai")
public class AiProperties {

    /** Active LLM provider: mock | openai | anthropic */
    private String provider = "mock";

    private int maxPromptChars = 4_000;

    private OpenAi openai = new OpenAi();
    private Anthropic anthropic = new Anthropic();

    @Getter
    @Setter
    public static class OpenAi {
        private String apiKey = "";
        private String baseUrl = "https://api.openai.com/v1";
        private String model = "gpt-4o-mini";
        private int timeoutSeconds = 20;
    }

    @Getter
    @Setter
    public static class Anthropic {
        private String apiKey = "";
        private String baseUrl = "https://api.anthropic.com/v1";
        private String model = "claude-3-5-haiku-20241022";
        private int timeoutSeconds = 20;
        private int maxTokens = 1024;
    }
}
