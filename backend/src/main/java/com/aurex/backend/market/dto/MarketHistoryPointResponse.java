package com.aurex.backend.market.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketHistoryPointResponse(LocalDate date, BigDecimal price) {}
