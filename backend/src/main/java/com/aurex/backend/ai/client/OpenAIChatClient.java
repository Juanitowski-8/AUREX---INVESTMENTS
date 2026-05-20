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
public class OpenAIChatClient {

    private final WebClient webClient;
    private final AiProperties aiProperties;

    public OpenAIChatClient(AiProperties aiProperties, WebClient.Builder webClientBuilder) {
        this.aiProperties = aiProperties;
        Duration timeout = Duration.ofSeconds(aiProperties.getOpenai().getTimeoutSeconds());

        this.webClient =
                webClientBuilder
                        .baseUrl(aiProperties.getOpenai().getBaseUrl())
                        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + aiProperties.getOpenai().getApiKey())
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .build();
    }

    public boolean isConfigured() {
        return StringUtils.hasText(aiProperties.getOpenai().getApiKey());
    }

    public String completeJson(String systemPrompt, String userPrompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("OpenAI API key is not configured");
        }

        ChatCompletionRequest request =
                new ChatCompletionRequest(
                        aiProperties.getOpenai().getModel(),
                        List.of(
                                new ChatMessage("system", systemPrompt),
                                new ChatMessage("user", userPrompt)),
                        new ResponseFormat("json_object"));

        Duration timeout = Duration.ofSeconds(aiProperties.getOpenai().getTimeoutSeconds());

        try {
            ChatCompletionResponse response =
                    webClient
                            .post()
                            .uri("/chat/completions")
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(ChatCompletionResponse.class)
                            .timeout(timeout)
                            .block();

            if (response == null
                    || response.choices() == null
                    || response.choices().isEmpty()
                    || response.choices().getFirst().message() == null
                    || !StringUtils.hasText(response.choices().getFirst().message().content())) {
                throw new IllegalStateException("OpenAI returned an empty completion");
            }

            return response.choices().getFirst().message().content();
        } catch (WebClientResponseException ex) {
            log.warn("OpenAI HTTP error status={}: {}", ex.getStatusCode().value(), ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.warn("OpenAI request failed: {}", ex.getMessage());
            throw ex;
        }
    }

    public record ChatCompletionRequest(
            String model, List<ChatMessage> messages, @JsonProperty("response_format") ResponseFormat responseFormat) {}

    public record ChatMessage(String role, String content) {}

    public record ResponseFormat(String type) {}

    public record ChatCompletionResponse(List<Choice> choices) {}

    public record Choice(ChatMessage message) {}
}
