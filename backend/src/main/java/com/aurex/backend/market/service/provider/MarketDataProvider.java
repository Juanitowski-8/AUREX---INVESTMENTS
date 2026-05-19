package com.aurex.backend.market.service.provider;

import com.aurex.backend.market.entity.Asset;
import java.util.List;
import java.util.Optional;

/**
 * Abstraction for external market data sources (CoinGecko, Alpha Vantage, etc.).
 * Implementations are swapped via Spring configuration.
 */
public interface MarketDataProvider {

    String getSource();

    Optional<MarketQuote> fetchQuote(Asset asset);

    List<MarketHistoryPoint> fetchHistory(Asset asset, int days);
}
