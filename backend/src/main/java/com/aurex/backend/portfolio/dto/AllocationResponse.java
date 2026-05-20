package com.aurex.backend.portfolio.dto;

import java.math.BigDecimal;

public record AllocationResponse(String symbol, BigDecimal value, BigDecimal percentage) {}
