package com.aurex.backend.market.cache;

import com.aurex.backend.market.dto.MarketHistoryPointResponse;
import com.aurex.backend.market.dto.MarketTickerResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(MarketRedisCache.class)
public class NoOpMarketCache implements MarketCache {

    @Override
    public Optional<List<MarketTickerResponse>> getTicker(String symbolsKey) {
        return Optional.empty();
    }

    @Override
    public void putTicker(String symbolsKey, List<MarketTickerResponse> tickers) {}

    @Override
    public Optional<List<MarketHistoryPointResponse>> getHistory(String symbol, int days) {
        return Optional.empty();
    }

    @Override
    public void putHistory(String symbol, int days, List<MarketHistoryPointResponse> history) {}
}
