package com.aurex.backend.ai.client;

import com.aurex.backend.config.AiProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
public class AnthropicChatClient {

    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final WebClient webClient;
    private final AiProperties aiProperties;

    public AnthropicChatClient(AiProperties aiProperties, WebClient.Builder webClientBuilder) {
        this.aiProperties = aiProperties;
        AiProperties.Anthropic anthropic = aiProperties.getAnthropic();

        this.webClient =
                webClientBuilder
                        .baseUrl(anthropic.getBaseUrl())
                        .defaultHeader("x-api-key", anthropic.getApiKey())
                        .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .build();
    }

    public boolean isConfigured() {
        return StringUtils.hasText(aiProperties.getAnthropic().getApiKey());
    }

    public String completeJson(String systemPrompt, String userPrompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("Anthropic API key is not configured");
        }

        AiProperties.Anthropic anthropic = aiProperties.getAnthropic();
        MessageRequest request =
                new MessageRequest(
                        anthropic.getModel(),
                        anthropic.getMaxTokens(),
                        systemPrompt,
                        List.of(new Message("user", userPrompt)));

        Duration timeout = Duration.ofSeconds(anthropic.getTimeoutSeconds());

        try {
            MessageResponse response =
                    webClient
                            .post()
                            .uri("/messages")
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(MessageResponse.class)
                            .timeout(timeout)
                            .block();

            if (response == null || response.content() == null) {
                throw new IllegalStateException("Anthropic returned an empty completion");
            }

            return response.content().stream()
                    .filter(block -> "text".equals(block.type()) && StringUtils.hasText(block.text()))
                    .map(ContentBlock::text)
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Anthropic returned no text content"));
        } catch (WebClientResponseException ex) {
            log.warn("Anthropic HTTP error status={}: {}", ex.getStatusCode().value(), ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.warn("Anthropic request failed: {}", ex.getMessage());
            throw ex;
        }
    }

    public record MessageRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            String system,
            List<Message> messages) {}

    public record Message(String role, String content) {}

    public record MessageResponse(List<ContentBlock> content) {}

    public record ContentBlock(String type, String text) {}
}
