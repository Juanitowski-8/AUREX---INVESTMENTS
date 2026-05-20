package com.aurex.backend.market.dto;

import com.aurex.backend.market.entity.AssetType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MarketAssetResponse(
        UUID id,
        String symbol,
        String name,
        AssetType assetType,
        String externalId,
        BigDecimal price,
        BigDecimal change24h,
        String source,
        Instant updatedAt,
        BigDecimal marketCap,
        BigDecimal volume24h) {}
