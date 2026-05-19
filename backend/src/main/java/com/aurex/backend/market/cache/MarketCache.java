package com.aurex.backend.market.cache;

import com.aurex.backend.market.dto.MarketHistoryPointResponse;
import com.aurex.backend.market.dto.MarketTickerResponse;
import java.util.List;
import java.util.Optional;

public interface MarketCache {

    Optional<List<MarketTickerResponse>> getTicker(String symbolsKey);

    void putTicker(String symbolsKey, List<MarketTickerResponse> tickers);

    Optional<List<MarketHistoryPointResponse>> getHistory(String symbol, int days);

    void putHistory(String symbol, int days, List<MarketHistoryPointResponse> history);
}
