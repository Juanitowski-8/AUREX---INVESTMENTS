package com.aurex.backend.portfolio.dto;

import com.aurex.backend.market.entity.AssetType;
import java.math.BigDecimal;
import java.util.UUID;

public record HoldingResponse(
        UUID id,
        String assetSymbol,
        String assetName,
        AssetType assetType,
        BigDecimal quantity,
        BigDecimal averageBuyPrice,
        BigDecimal currentPrice,
        BigDecimal marketValue,
        BigDecimal pnl,
        BigDecimal allocation) {}
