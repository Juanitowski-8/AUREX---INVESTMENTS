package com.aurex.backend.market.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class MarketDataServiceCacheKeyTest {

    @Test
    void symbolsCacheKeyIsSortedAndCanonical() {
        String key = MarketDataService.toSymbolsCacheKey(List.of("SOL", "BTC", "ETH"));
        assertThat(key).isEqualTo("BTC,ETH,SOL");
    }
}
