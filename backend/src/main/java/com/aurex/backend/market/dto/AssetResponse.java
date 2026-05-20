package com.aurex.backend.market.dto;

import com.aurex.backend.market.entity.AssetType;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String symbol,
        String name,
        AssetType assetType,
        String externalId,
        String source,
        boolean active) {}
