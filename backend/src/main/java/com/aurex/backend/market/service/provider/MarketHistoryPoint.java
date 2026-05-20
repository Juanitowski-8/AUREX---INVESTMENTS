package com.aurex.backend.market.service.provider;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketHistoryPoint(LocalDate date, BigDecimal price) {}
