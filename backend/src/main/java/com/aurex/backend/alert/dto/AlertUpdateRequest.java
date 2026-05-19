package com.aurex.backend.alert.dto;

import com.aurex.backend.alert.entity.ConditionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AlertUpdateRequest(
        @NotNull(message = "Condition type is required") ConditionType conditionType,
        @NotNull(message = "Target price is required")
                @DecimalMin(value = "0", inclusive = false, message = "Target price must be greater than 0")
                BigDecimal targetPrice) {}
