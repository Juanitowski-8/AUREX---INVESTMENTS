package com.aurex.backend.portfolio.dto;

import com.aurex.backend.portfolio.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CreateTransactionRequest(
        @NotNull(message = "Portfolio id is required") UUID portfolioId,
        @NotBlank(message = "Asset symbol is required") String assetSymbol,
        @NotNull(message = "Transaction type is required") TransactionType type,
        @NotNull(message = "Quantity is required")
                @DecimalMin(value = "0", inclusive = false, message = "Quantity must be greater than 0")
                BigDecimal quantity,
        @NotNull(message = "Price is required")
                @DecimalMin(value = "0", inclusive = false, message = "Price must be greater than 0")
                BigDecimal price,
        @NotNull(message = "Transaction date is required") Instant transactionDate,
        @Size(max = 1000, message = "Notes must be at most 1000 characters") String notes) {}
