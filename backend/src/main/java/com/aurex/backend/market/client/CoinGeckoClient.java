package com.aurex.backend.market.client;

import com.aurex.backend.config.CoinGeckoProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
public class CoinGeckoClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public CoinGeckoClient(CoinGeckoProperties properties, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Duration timeout = Duration.ofSeconds(properties.getTimeoutSeconds());
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);

        this.restClient =
                RestClient.builder()
                        .baseUrl(properties.getBaseUrl())
                        .requestFactory(requestFactory)
                        .build();
    }

    public Map<String, CoinGeckoSimplePriceDto> fetchSimplePrices(List<String> coinIds) {
        if (coinIds.isEmpty()) {
            return Map.of();
        }

        String ids = String.join(",", coinIds);

        try {
            String body =
                    restClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/simple/price")
                                                    .queryParam("ids", ids)
                                                    .queryParam("vs_currencies", "usd")
                                                    .queryParam("include_24hr_change", "true")
                                                    .queryParam("include_market_cap", "true")
                                                    .queryParam("include_24hr_vol", "true")
                                                    .build())
                            .retrieve()
                            .body(String.class);

            if (body == null || body.isBlank()) {
                return Map.of();
            }

            return objectMapper.readValue(
                    body, new TypeReference<Map<String, CoinGeckoSimplePriceDto>>() {});
        } catch (HttpClientErrorException.TooManyRequests ex) {
            log.warn("CoinGecko rate limit exceeded for ids={}", ids);
            return Map.of();
        } catch (RestClientException | com.fasterxml.jackson.core.JsonProcessingException ex) {
            log.error("CoinGecko simple price request failed for ids={}: {}", ids, ex.getMessage());
            return Map.of();
        }
    }

    public List<List<Number>> fetchMarketChartPrices(String coinId, int days) {
        int safeDays = Math.max(1, Math.min(days, 365));

        try {
            CoinGeckoMarketChartDto chart =
                    restClient
                            .get()
                            .uri(
                                    "/coins/{id}/market_chart?vs_currency=usd&days={days}",
                                    coinId,
                                    safeDays)
                            .retrieve()
                            .body(CoinGeckoMarketChartDto.class);

            if (chart == null || chart.prices() == null) {
                return List.of();
            }
            return chart.prices();
        } catch (HttpClientErrorException.TooManyRequests ex) {
            log.warn("CoinGecko rate limit exceeded for history id={}", coinId);
            return List.of();
        } catch (RestClientException ex) {
            log.error(
                    "CoinGecko market chart request failed for id={}: {}", coinId, ex.getMessage());
            return List.of();
        }
    }
}
