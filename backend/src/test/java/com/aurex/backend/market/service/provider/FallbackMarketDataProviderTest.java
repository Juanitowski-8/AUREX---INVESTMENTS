package com.aurex.backend.market.service.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.AssetType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FallbackMarketDataProviderTest {

    @Mock private CoinGeckoMarketDataProvider coinGeckoMarketDataProvider;

    @Mock private MockMarketDataProvider mockMarketDataProvider;

    private FallbackMarketDataProvider provider;

    private final Asset btc =
            Asset.builder()
                    .symbol("BTC")
                    .name("Bitcoin")
                    .assetType(AssetType.CRYPTO)
                    .externalId("bitcoin")
                    .active(true)
                    .build();

    @BeforeEach
    void setUp() {
        provider = new FallbackMarketDataProvider(coinGeckoMarketDataProvider, mockMarketDataProvider);
    }

    @Test
    void usesCoinGeckoWhenAvailable() {
        MarketQuote live =
                new MarketQuote(
                        new BigDecimal("68000"),
                        new BigDecimal("2.5"),
                        Instant.now(),
                        new BigDecimal("1000000"),
                        new BigDecimal("50000"),
                        "COINGECKO");

        when(coinGeckoMarketDataProvider.fetchQuote(btc)).thenReturn(Optional.of(live));

        Optional<MarketQuote> result = provider.fetchQuote(btc);

        assertThat(result).isPresent();
        assertThat(result.get().source()).isEqualTo("COINGECKO");
        assertThat(result.get().price()).isEqualByComparingTo("68000");
    }

    @Test
    void fallsBackToMockWhenCoinGeckoFails() {
        when(coinGeckoMarketDataProvider.fetchQuote(btc)).thenReturn(Optional.empty());
        when(mockMarketDataProvider.fetchQuote(btc))
                .thenReturn(
                        Optional.of(
                                new MarketQuote(
                                        new BigDecimal("68420.50"),
                                        new BigDecimal("2.84"),
                                        Instant.now(),
                                        null,
                                        null,
                                        "MOCK")));

        Optional<MarketQuote> result = provider.fetchQuote(btc);

        assertThat(result).isPresent();
        assertThat(result.get().source()).isEqualTo("MOCK");
    }
}
