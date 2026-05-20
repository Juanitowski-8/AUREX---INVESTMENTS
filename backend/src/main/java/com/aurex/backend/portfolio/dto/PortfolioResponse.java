package com.aurex.backend.portfolio.dto;

import java.time.Instant;
import java.util.UUID;

public record PortfolioResponse(
        UUID id,
        String name,
        String baseCurrency,
        String description,
        Instant createdAt,
        Instant updatedAt) {}
