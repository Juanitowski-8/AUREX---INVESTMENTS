package com.aurex.backend.alert.dto;

import com.aurex.backend.alert.entity.ConditionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
        UUID id,
        String assetSymbol,
        String assetName,
        ConditionType conditionType,
        BigDecimal targetPrice,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt) {}
