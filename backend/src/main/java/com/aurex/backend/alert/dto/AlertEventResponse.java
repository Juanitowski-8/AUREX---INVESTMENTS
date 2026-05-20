package com.aurex.backend.alert.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AlertEventResponse(
        UUID id,
        UUID alertRuleId,
        String assetSymbol,
        String assetName,
        BigDecimal triggeredPrice,
        String message,
        Instant triggeredAt,
        boolean read) {}
