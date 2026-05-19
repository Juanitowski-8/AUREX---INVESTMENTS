package com.aurex.backend.portfolio.mapper;

import com.aurex.backend.portfolio.dto.HoldingResponse;
import com.aurex.backend.portfolio.entity.Holding;
import java.math.BigDecimal;
import java.math.RoundingMode;

public final class HoldingMapper {

    private static final int PRICE_SCALE = 4;
    private static final int VALUE_SCALE = 4;

    private HoldingMapper() {}

    public static HoldingResponse toResponse(Holding holding, BigDecimal currentPrice) {
        BigDecimal quantity = holding.getQuantity();
        BigDecimal averageBuyPrice = holding.getAverageBuyPrice();
        BigDecimal costBasis = quantity.multiply(averageBuyPrice);

        BigDecimal marketValue = null;
        BigDecimal pnl = null;

        if (currentPrice != null) {
            marketValue = quantity.multiply(currentPrice).setScale(VALUE_SCALE, RoundingMode.HALF_UP);
            pnl = marketValue.subtract(costBasis).setScale(VALUE_SCALE, RoundingMode.HALF_UP);
        }

        return new HoldingResponse(
                holding.getId(),
                holding.getAsset().getSymbol(),
                holding.getAsset().getName(),
                holding.getAsset().getAssetType(),
                quantity,
                averageBuyPrice,
                currentPrice,
                marketValue,
                pnl,
                null);
    }

    public static HoldingResponse toResponse(Holding holding) {
        return toResponse(holding, null);
    }
}
