package com.aurex.backend.portfolio.dto;

import com.aurex.backend.portfolio.entity.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID portfolioId,
        String assetSymbol,
        String assetName,
        TransactionType type,
        BigDecimal quantity,
        BigDecimal price,
        Instant transactionDate,
        String notes,
        Instant createdAt) {}
