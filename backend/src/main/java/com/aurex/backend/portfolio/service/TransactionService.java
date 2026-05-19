package com.aurex.backend.portfolio.service;

import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.common.security.AuthenticatedUserProvider;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.service.AssetService;
import com.aurex.backend.portfolio.dto.CreateTransactionRequest;
import com.aurex.backend.portfolio.dto.TransactionResponse;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.entity.Transaction;
import com.aurex.backend.portfolio.mapper.TransactionMapper;
import com.aurex.backend.portfolio.repository.TransactionRepository;
import com.aurex.backend.user.entity.User;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioService portfolioService;
    private final AssetService assetService;
    private final HoldingService holdingService;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Transactional
    public TransactionResponse create(CreateTransactionRequest request) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(request.portfolioId());
        Asset asset = assetService.findActiveBySymbol(request.assetSymbol());

        Transaction transaction =
                Transaction.builder()
                        .portfolio(portfolio)
                        .asset(asset)
                        .type(request.type())
                        .quantity(HoldingService.normalizeQuantity(request.quantity()))
                        .price(HoldingService.normalizePrice(request.price()))
                        .transactionDate(request.transactionDate())
                        .notes(normalizeNotes(request.notes()))
                        .build();

        holdingService.applyTransaction(
                portfolio, asset, request.type(), request.quantity(), request.price());

        Transaction saved = transactionRepository.save(transaction);
        return TransactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> listByPortfolio(UUID portfolioId) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(portfolioId);
        return transactionRepository
                .findByPortfolioIdWithAssetOrderByTransactionDateDesc(portfolio.getId())
                .stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public void delete(UUID transactionId) {
        User user = authenticatedUserProvider.getCurrentUser();
        Transaction transaction =
                transactionRepository
                        .findByIdAndPortfolio_User_Id(transactionId, user.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        UUID portfolioId = transaction.getPortfolio().getId();
        transactionRepository.delete(transaction);
        recalculateHoldings(portfolioId);
    }

    private void recalculateHoldings(UUID portfolioId) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(portfolioId);
        holdingService.deleteAllForPortfolio(portfolioId);

        List<Transaction> transactions =
                transactionRepository.findByPortfolioIdWithAssetOrderByTransactionDateAsc(portfolioId);

        for (Transaction transaction : transactions) {
            holdingService.applyTransaction(
                    portfolio,
                    transaction.getAsset(),
                    transaction.getType(),
                    transaction.getQuantity(),
                    transaction.getPrice());
        }
    }

    private static String normalizeNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }
        return notes.trim();
    }
}
