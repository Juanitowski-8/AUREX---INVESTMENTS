package com.aurex.backend.portfolio.dto;

import java.math.BigDecimal;

public record AssetPerformanceResponse(String symbol, BigDecimal pnlPercentage) {}
