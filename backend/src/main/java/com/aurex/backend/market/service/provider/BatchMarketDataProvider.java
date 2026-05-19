package com.aurex.backend.market.service.provider;

import com.aurex.backend.market.entity.Asset;
import java.util.List;
import java.util.Map;

/** Providers that can fetch multiple quotes in one external API call. */
public interface BatchMarketDataProvider extends MarketDataProvider {

    Map<String, MarketQuote> fetchQuotes(List<Asset> assets);
}
