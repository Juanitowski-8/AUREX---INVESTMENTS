package com.aurex.backend.market.cache;

import com.aurex.backend.config.MarketProperties;
import com.aurex.backend.market.dto.MarketHistoryPointResponse;
import com.aurex.backend.market.dto.MarketTickerResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnBean(RedisConnectionFactory.class)
@ConditionalOnProperty(name = "aurex.market.cache-enabled", havingValue = "true", matchIfMissing = true)
public class MarketRedisCache implements MarketCache {

    private static final String TICKER_PREFIX = "market:ticker:";
    private static final String HISTORY_PREFIX = "market:history:";

    private final RedisTemplate<String, String> marketRedisTemplate;
    private final ObjectMapper objectMapper;
    private final MarketProperties marketProperties;

    @Override
    public Optional<List<MarketTickerResponse>> getTicker(String symbolsKey) {
        return get(TICKER_PREFIX + symbolsKey, new TypeReference<>() {});
    }

    @Override
    public void putTicker(String symbolsKey, List<MarketTickerResponse> tickers) {
        put(TICKER_PREFIX + symbolsKey, tickers);
    }

    @Override
    public Optional<List<MarketHistoryPointResponse>> getHistory(String symbol, int days) {
        return get(historyKey(symbol, days), new TypeReference<>() {});
    }

    @Override
    public void putHistory(String symbol, int days, List<MarketHistoryPointResponse> history) {
        put(historyKey(symbol, days), history);
    }

    private String historyKey(String symbol, int days) {
        return HISTORY_PREFIX + symbol.toUpperCase() + ":" + days;
    }

    private <T> Optional<T> get(String key, TypeReference<T> type) {
        if (!marketProperties.isCacheEnabled()) {
            return Optional.empty();
        }

        try {
            String json = marketRedisTemplate.opsForValue().get(key);
            if (json == null || json.isBlank()) {
                log.info("CACHE_MISS key={}", key);
                return Optional.empty();
            }
            log.info("CACHE_HIT key={}", key);
            return Optional.of(objectMapper.readValue(json, type));
        } catch (Exception ex) {
            log.warn("Redis read failed for key={}, bypassing cache: {}", key, ex.getMessage());
            return Optional.empty();
        }
    }

    private void put(String key, Object value) {
        if (!marketProperties.isCacheEnabled()) {
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(value);
            marketRedisTemplate
                    .opsForValue()
                    .set(key, json, Duration.ofSeconds(marketProperties.getCacheTtlSeconds()));
            log.debug("CACHE_PUT key={} ttlSeconds={}", key, marketProperties.getCacheTtlSeconds());
        } catch (Exception ex) {
            log.warn("Redis write failed for key={}, continuing without cache: {}", key, ex.getMessage());
        }
    }
}
