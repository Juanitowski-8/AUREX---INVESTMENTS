package com.aurex.backend.portfolio.mapper;

import com.aurex.backend.portfolio.dto.TransactionResponse;
import com.aurex.backend.portfolio.entity.Transaction;

public final class TransactionMapper {

    private TransactionMapper() {}

    public static TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getPortfolio().getId(),
                transaction.getAsset().getSymbol(),
                transaction.getAsset().getName(),
                transaction.getType(),
                transaction.getQuantity(),
                transaction.getPrice(),
                transaction.getTransactionDate(),
                transaction.getNotes(),
                transaction.getCreatedAt());
    }
}
