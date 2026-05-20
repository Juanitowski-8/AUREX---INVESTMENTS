package com.aurex.backend.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class HoldingServiceTest {

    @Test
    void weightedAverageBuyPriceFormula() {
        BigDecimal previousQty = new BigDecimal("0.25");
        BigDecimal previousAvg = new BigDecimal("65000");
        BigDecimal buyQty = new BigDecimal("0.25");
        BigDecimal buyPrice = new BigDecimal("70000");

        BigDecimal previousCost = previousQty.multiply(previousAvg);
        BigDecimal purchaseCost = buyQty.multiply(buyPrice);
        BigDecimal newQty = previousQty.add(buyQty);
        BigDecimal newAvg = previousCost.add(purchaseCost).divide(newQty, 4, java.math.RoundingMode.HALF_UP);

        assertThat(newAvg).isEqualByComparingTo("67500");
    }
}
