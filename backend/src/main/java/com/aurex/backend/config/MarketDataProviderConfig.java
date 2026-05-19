package com.aurex.backend.config;

import com.aurex.backend.market.service.provider.CoinGeckoMarketDataProvider;
import com.aurex.backend.market.service.provider.FallbackMarketDataProvider;
import com.aurex.backend.market.service.provider.MarketDataProvider;
import com.aurex.backend.market.service.provider.MockMarketDataProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class MarketDataProviderConfig {

    @Bean
    @Primary
    public MarketDataProvider marketDataProvider(
            MarketProperties marketProperties,
            MockMarketDataProvider mockMarketDataProvider,
            CoinGeckoMarketDataProvider coinGeckoMarketDataProvider) {

        if ("coingecko".equalsIgnoreCase(marketProperties.getProvider())) {
            return new FallbackMarketDataProvider(coinGeckoMarketDataProvider, mockMarketDataProvider);
        }
        return mockMarketDataProvider;
    }
}
