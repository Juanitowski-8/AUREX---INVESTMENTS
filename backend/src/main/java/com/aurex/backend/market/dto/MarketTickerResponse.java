package com.aurex.backend.market.dto;

import com.aurex.backend.market.entity.AssetType;
import java.math.BigDecimal;
import java.time.Instant;

public record MarketTickerResponse(
        String symbol,
        String name,
        BigDecimal price,
        BigDecimal change24h,
        AssetType assetType,
        String source,
        Instant updatedAt,
        BigDecimal marketCap,
        BigDecimal volume24h) {}
