package com.aurex.backend.market.service.provider;

import com.aurex.backend.market.client.CoinGeckoClient;
import com.aurex.backend.market.client.CoinGeckoSimplePriceDto;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.AssetType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class CoinGeckoMarketDataProvider implements BatchMarketDataProvider {

    private static final String SOURCE = "COINGECKO";
    private static final int PRICE_SCALE = 2;
    private static final int CHANGE_SCALE = 2;

    private final CoinGeckoClient coinGeckoClient;

    @Override
    public String getSource() {
        return SOURCE;
    }

    @Override
    public Optional<MarketQuote> fetchQuote(Asset asset) {
        if (!supportsCoinGecko(asset)) {
            return Optional.empty();
        }
        return Optional.ofNullable(fetchQuotes(List.of(asset)).get(asset.getSymbol().toUpperCase()));
    }

    @Override
    public Map<String, MarketQuote> fetchQuotes(List<Asset> assets) {
        List<Asset> cryptoAssets =
                assets.stream().filter(this::supportsCoinGecko).distinct().toList();

        if (cryptoAssets.isEmpty()) {
            return Map.of();
        }

        List<String> coinIds =
                cryptoAssets.stream()
                        .map(Asset::getExternalId)
                        .filter(StringUtils::hasText)
                        .distinct()
                        .toList();

        Map<String, CoinGeckoSimplePriceDto> pricesByCoinId =
                coinGeckoClient.fetchSimplePrices(coinIds);

        Map<String, MarketQuote> quotes = new LinkedHashMap<>();
        Instant updatedAt = Instant.now();

        for (Asset asset : cryptoAssets) {
            CoinGeckoSimplePriceDto dto = pricesByCoinId.get(asset.getExternalId());
            if (dto == null || dto.usd() == null) {
                log.debug("No CoinGecko price for symbol={} id={}", asset.getSymbol(), asset.getExternalId());
                continue;
            }
            quotes.put(asset.getSymbol().toUpperCase(), toQuote(dto, updatedAt));
        }

        return quotes;
    }

    @Override
    public List<MarketHistoryPoint> fetchHistory(Asset asset, int days) {
        if (!supportsCoinGecko(asset)) {
            return List.of();
        }

        List<List<Number>> raw =
                coinGeckoClient.fetchMarketChartPrices(asset.getExternalId(), days);

        if (raw.isEmpty()) {
            return List.of();
        }

        return raw.stream()
                .filter(point -> point.size() >= 2)
                .map(
                        point -> {
                            long epochMs = point.get(0).longValue();
                            BigDecimal price =
                                    new BigDecimal(point.get(1).toString())
                                            .setScale(PRICE_SCALE, RoundingMode.HALF_UP);
                            LocalDate date =
                                    Instant.ofEpochMilli(epochMs)
                                            .atZone(ZoneOffset.UTC)
                                            .toLocalDate();
                            return new MarketHistoryPoint(date, price);
                        })
                .collect(Collectors.toMap(MarketHistoryPoint::date, p -> p, (a, b) -> b))
                .values()
                .stream()
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .toList();
    }

    private boolean supportsCoinGecko(Asset asset) {
        return asset.getAssetType() == AssetType.CRYPTO
                && StringUtils.hasText(asset.getExternalId());
    }

    private MarketQuote toQuote(CoinGeckoSimplePriceDto dto, Instant updatedAt) {
        BigDecimal change =
                dto.usd24hChange() != null
                        ? dto.usd24hChange().setScale(CHANGE_SCALE, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

        return new MarketQuote(
                dto.usd().setScale(PRICE_SCALE, RoundingMode.HALF_UP),
                change,
                updatedAt,
                scaleOrNull(dto.usdMarketCap()),
                scaleOrNull(dto.usd24hVol()),
                SOURCE);
    }

    private static BigDecimal scaleOrNull(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.setScale(PRICE_SCALE, RoundingMode.HALF_UP);
    }
}
