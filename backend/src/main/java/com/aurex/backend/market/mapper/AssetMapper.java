package com.aurex.backend.market.mapper;

import com.aurex.backend.market.dto.AssetResponse;
import com.aurex.backend.market.entity.Asset;

public final class AssetMapper {

    private AssetMapper() {}

    public static AssetResponse toResponse(Asset asset) {
        return new AssetResponse(
                asset.getId(),
                asset.getSymbol(),
                asset.getName(),
                asset.getAssetType(),
                asset.getExternalId(),
                asset.getSource(),
                asset.isActive());
    }
}
