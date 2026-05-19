package com.aurex.backend.market.service.provider;

import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.AssetType;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

@Slf4j
@RequiredArgsConstructor
public class FallbackMarketDataProvider implements BatchMarketDataProvider {

    private final CoinGeckoMarketDataProvider coinGeckoMarketDataProvider;
    private final MockMarketDataProvider mockMarketDataProvider;

    @Override
    public String getSource() {
        return coinGeckoMarketDataProvider.getSource();
    }

    @Override
    public Optional<MarketQuote> fetchQuote(Asset asset) {
        if (isCoinGeckoAsset(asset)) {
            Optional<MarketQuote> live = coinGeckoMarketDataProvider.fetchQuote(asset);
            if (live.isPresent()) {
                return live;
            }
            log.warn("CoinGecko quote unavailable for {}, using mock fallback", asset.getSymbol());
        }
        return mockMarketDataProvider.fetchQuote(asset);
    }

    @Override
    public Map<String, MarketQuote> fetchQuotes(List<Asset> assets) {
        Map<String, MarketQuote> result = new LinkedHashMap<>();

        List<Asset> cryptoAssets = assets.stream().filter(this::isCoinGeckoAsset).toList();
        if (!cryptoAssets.isEmpty()) {
            Map<String, MarketQuote> live = coinGeckoMarketDataProvider.fetchQuotes(cryptoAssets);
            result.putAll(live);
        }

        for (Asset asset : assets) {
            String symbol = asset.getSymbol().toUpperCase();
            if (result.containsKey(symbol)) {
                continue;
            }
            mockMarketDataProvider
                    .fetchQuote(asset)
                    .ifPresent(quote -> result.put(symbol, quote));
        }

        return result;
    }

    @Override
    public List<MarketHistoryPoint> fetchHistory(Asset asset, int days) {
        if (isCoinGeckoAsset(asset)) {
            List<MarketHistoryPoint> live = coinGeckoMarketDataProvider.fetchHistory(asset, days);
            if (!live.isEmpty()) {
                return live;
            }
            log.warn("CoinGecko history unavailable for {}, using mock fallback", asset.getSymbol());
        }
        return mockMarketDataProvider.fetchHistory(asset, days);
    }

    private boolean isCoinGeckoAsset(Asset asset) {
        return asset.getAssetType() == AssetType.CRYPTO
                && StringUtils.hasText(asset.getExternalId());
    }
}
