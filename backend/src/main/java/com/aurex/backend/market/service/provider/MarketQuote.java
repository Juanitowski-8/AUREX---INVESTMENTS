package com.aurex.backend.market.service.provider;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketQuote(
        BigDecimal price,
        BigDecimal change24h,
        Instant updatedAt,
        BigDecimal marketCap,
        BigDecimal volume24h,
        String source) {

    public MarketQuote(BigDecimal price, BigDecimal change24h, Instant updatedAt) {
        this(price, change24h, updatedAt, null, null, "MOCK");
    }
}
