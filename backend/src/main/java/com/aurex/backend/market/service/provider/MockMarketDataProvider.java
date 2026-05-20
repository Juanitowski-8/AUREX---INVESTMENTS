package com.aurex.backend.market.service.provider;

import com.aurex.backend.market.entity.Asset;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MockMarketDataProvider implements MarketDataProvider {

    private static final String SOURCE = "MOCK";
    private static final int PRICE_SCALE = 2;
    private static final int CHANGE_SCALE = 2;

    private static final Map<String, BigDecimal> PRICES =
            Map.ofEntries(
                    Map.entry("BTC", new BigDecimal("68420.50")),
                    Map.entry("ETH", new BigDecimal("3521.80")),
                    Map.entry("SOL", new BigDecimal("148.25")),
                    Map.entry("AVAX", new BigDecimal("36.40")),
                    Map.entry("ADA", new BigDecimal("0.48")),
                    Map.entry("AAPL", new BigDecimal("192.35")),
                    Map.entry("NVDA", new BigDecimal("905.10")),
                    Map.entry("TSLA", new BigDecimal("248.60")),
                    Map.entry("SPY", new BigDecimal("521.75")));

    private static final Map<String, BigDecimal> CHANGE_24H =
            Map.ofEntries(
                    Map.entry("BTC", new BigDecimal("2.84")),
                    Map.entry("ETH", new BigDecimal("1.62")),
                    Map.entry("SOL", new BigDecimal("-0.95")),
                    Map.entry("AVAX", new BigDecimal("3.10")),
                    Map.entry("ADA", new BigDecimal("0.45")),
                    Map.entry("AAPL", new BigDecimal("0.88")),
                    Map.entry("NVDA", new BigDecimal("2.15")),
                    Map.entry("TSLA", new BigDecimal("-1.20")),
                    Map.entry("SPY", new BigDecimal("0.35")));

    @Override
    public String getSource() {
        return SOURCE;
    }

    @Override
    public Optional<MarketQuote> fetchQuote(Asset asset) {
        String symbol = asset.getSymbol().toUpperCase();
        BigDecimal price = PRICES.get(symbol);
        if (price == null) {
            return Optional.empty();
        }
        BigDecimal change = CHANGE_24H.getOrDefault(symbol, BigDecimal.ZERO);
        return Optional.of(
                new MarketQuote(
                        price.setScale(PRICE_SCALE, RoundingMode.HALF_UP),
                        change.setScale(CHANGE_SCALE, RoundingMode.HALF_UP),
                        Instant.now(),
                        null,
                        null,
                        SOURCE));
    }

    @Override
    public List<MarketHistoryPoint> fetchHistory(Asset asset, int days) {
        String symbol = asset.getSymbol().toUpperCase();
        BigDecimal basePrice = PRICES.getOrDefault(symbol, new BigDecimal("100"));
        int safeDays = Math.max(1, Math.min(days, 365));
        List<MarketHistoryPoint> points = new ArrayList<>(safeDays);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        for (int i = safeDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal factor = historyFactor(symbol, i, safeDays);
            BigDecimal price =
                    basePrice
                            .multiply(factor)
                            .setScale(PRICE_SCALE, RoundingMode.HALF_UP);
            points.add(new MarketHistoryPoint(date, price));
        }

        return points;
    }

    /** Deterministic pseudo-variation for repeatable mock charts. */
    private static BigDecimal historyFactor(String symbol, int dayIndex, int totalDays) {
        int seed = symbol.hashCode();
        double wave = Math.sin((seed % 360) + (dayIndex * 0.35));
        double trend = (dayIndex - (totalDays / 2.0)) * 0.002;
        double factor = 1.0 + (wave * 0.04) + trend;
        return BigDecimal.valueOf(factor);
    }
}
