package com.aurex.backend.market.service;

import com.aurex.backend.common.exception.InvalidSymbolsException;
import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.config.MarketProperties;
import com.aurex.backend.market.cache.MarketCache;
import com.aurex.backend.market.dto.MarketAssetResponse;
import com.aurex.backend.market.dto.MarketHistoryPointResponse;
import com.aurex.backend.market.dto.MarketTickerResponse;
import com.aurex.backend.market.dto.ResolvedPrice;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.PriceSnapshot;
import com.aurex.backend.market.repository.AssetRepository;
import com.aurex.backend.market.repository.PriceSnapshotRepository;
import com.aurex.backend.market.service.provider.BatchMarketDataProvider;
import com.aurex.backend.market.service.provider.MarketDataProvider;
import com.aurex.backend.market.service.provider.MarketHistoryPoint;
import com.aurex.backend.market.service.provider.MarketQuote;
import java.util.Map;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final AssetRepository assetRepository;
    private final AssetService assetService;
    private final PriceSnapshotRepository priceSnapshotRepository;
    private final MarketDataProvider marketDataProvider;
    private final MarketProperties marketProperties;
    private final MarketCache marketCache;

    @Transactional(readOnly = true)
    public List<MarketTickerResponse> getTicker(String symbolsParam) {
        List<String> symbols = parseSymbols(symbolsParam);
        String cacheKey = toSymbolsCacheKey(symbols);

        return marketCache
                .getTicker(cacheKey)
                .orElseGet(
                        () -> {
                            List<MarketTickerResponse> tickers = loadTickerFromProvider(symbols);
                            marketCache.putTicker(cacheKey, tickers);
                            return tickers;
                        });
    }

    @Transactional(readOnly = true)
    public List<MarketAssetResponse> listMarketAssets() {
        return assetRepository.findByActiveTrueOrderBySymbolAsc().stream()
                .map(this::buildMarketAsset)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MarketHistoryPointResponse> getHistory(String symbol, Integer days) {
        Asset asset = assetService.findActiveBySymbol(symbol);
        int historyDays =
                days != null && days > 0 ? days : marketProperties.getDefaultHistoryDays();
        String normalizedSymbol = asset.getSymbol().toUpperCase();

        return marketCache
                .getHistory(normalizedSymbol, historyDays)
                .orElseGet(
                        () -> {
                            List<MarketHistoryPointResponse> history =
                                    loadHistoryFromProvider(asset, historyDays);
                            marketCache.putHistory(normalizedSymbol, historyDays, history);
                            return history;
                        });
    }

    @Transactional(readOnly = true)
    public List<Asset> listCatalogAssets() {
        return assetRepository.findByActiveTrueOrderBySymbolAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Asset> resolveAsset(String symbol) {
        return assetRepository.findBySymbolIgnoreCase(symbol.trim());
    }

    @Transactional(readOnly = true)
    public Asset requireAsset(String symbol) {
        return assetService.findActiveBySymbol(symbol);
    }

    /**
     * Current market price for alert evaluation and similar use cases.
     */
    @Transactional(readOnly = true)
    public Optional<BigDecimal> getCurrentPrice(Asset asset) {
        Optional<MarketQuote> quote = marketDataProvider.fetchQuote(asset);
        if (quote.isPresent()) {
            return Optional.of(quote.get().price());
        }

        return priceSnapshotRepository
                .findFirstByAssetIdOrderByCapturedAtDesc(asset.getId())
                .map(PriceSnapshot::getPrice);
    }

    /**
     * Resolves a price for portfolio valuation: market provider, latest DB snapshot, then fallback.
     */
    @Transactional(readOnly = true)
    public ResolvedPrice resolveCurrentPrice(Asset asset, BigDecimal averageBuyPriceFallback) {
        Optional<MarketQuote> quote = marketDataProvider.fetchQuote(asset);
        if (quote.isPresent()) {
            MarketQuote q = quote.get();
            return new ResolvedPrice(q.price(), q.updatedAt(), true);
        }

        return priceSnapshotRepository
                .findFirstByAssetIdOrderByCapturedAtDesc(asset.getId())
                .map(
                        snapshot ->
                                new ResolvedPrice(
                                        snapshot.getPrice(), snapshot.getCapturedAt(), true))
                .orElse(
                        new ResolvedPrice(
                                averageBuyPriceFallback, Instant.now(), false));
    }

    private List<MarketTickerResponse> loadTickerFromProvider(List<String> symbols) {
        List<Asset> assets =
                symbols.stream()
                        .map(assetRepository::findBySymbolIgnoreCase)
                        .flatMap(Optional::stream)
                        .filter(Asset::isActive)
                        .toList();

        if (assets.isEmpty()) {
            throw new InvalidSymbolsException("No valid symbols found: " + String.join(",", symbols));
        }

        if (marketDataProvider instanceof BatchMarketDataProvider batchProvider) {
            Map<String, MarketQuote> quotes = batchProvider.fetchQuotes(assets);
            return assets.stream()
                    .map(
                            asset -> {
                                MarketQuote quote =
                                        quotes.get(asset.getSymbol().toUpperCase());
                                if (quote == null) {
                                    throw new ResourceNotFoundException(
                                            "Price not available for: " + asset.getSymbol());
                                }
                                return toTickerResponse(asset, quote);
                            })
                    .toList();
        }

        return assets.stream().map(this::buildTicker).toList();
    }

    private List<MarketHistoryPointResponse> loadHistoryFromProvider(Asset asset, int historyDays) {
        return marketDataProvider.fetchHistory(asset, historyDays).stream()
                .map(p -> new MarketHistoryPointResponse(p.date(), p.price()))
                .toList();
    }

    private MarketTickerResponse buildTicker(Asset asset) {
        MarketQuote quote =
                marketDataProvider
                        .fetchQuote(asset)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Price not available for: " + asset.getSymbol()));
        return toTickerResponse(asset, quote);
    }

    private MarketTickerResponse toTickerResponse(Asset asset, MarketQuote quote) {
        maybePersistSnapshot(asset, quote);
        return new MarketTickerResponse(
                asset.getSymbol(),
                asset.getName(),
                quote.price(),
                quote.change24h(),
                asset.getAssetType(),
                quote.source(),
                quote.updatedAt(),
                quote.marketCap(),
                quote.volume24h());
    }

    private MarketAssetResponse buildMarketAsset(Asset asset) {
        MarketQuote quote =
                marketDataProvider
                        .fetchQuote(asset)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Price not available for: " + asset.getSymbol()));

        maybePersistSnapshot(asset, quote);

        return new MarketAssetResponse(
                asset.getId(),
                asset.getSymbol(),
                asset.getName(),
                asset.getAssetType(),
                asset.getExternalId(),
                quote.price(),
                quote.change24h(),
                quote.source(),
                quote.updatedAt(),
                quote.marketCap(),
                quote.volume24h());
    }

    @Transactional
    protected void maybePersistSnapshot(Asset asset, MarketQuote quote) {
        boolean fromCoinGecko = "COINGECKO".equalsIgnoreCase(quote.source());
        if (!fromCoinGecko && !marketProperties.isPersistSnapshotsOnRead()) {
            return;
        }

        priceSnapshotRepository.save(
                PriceSnapshot.builder()
                        .asset(asset)
                        .price(quote.price())
                        .currency("USD")
                        .source(quote.source().toLowerCase())
                        .capturedAt(quote.updatedAt())
                        .build());
    }

    private static List<String> parseSymbols(String symbolsParam) {
        if (symbolsParam == null || symbolsParam.isBlank()) {
            throw new InvalidSymbolsException("Symbols parameter is required");
        }

        List<String> symbols =
                Arrays.stream(symbolsParam.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .distinct()
                        .toList();

        if (symbols.isEmpty()) {
            throw new InvalidSymbolsException("Symbols parameter is required");
        }

        return symbols;
    }

    /** Canonical cache key: sorted symbols joined (e.g. BTC,ETH,SOL). */
    static String toSymbolsCacheKey(List<String> symbols) {
        return symbols.stream().sorted(Comparator.naturalOrder()).collect(Collectors.joining(","));
    }
}
