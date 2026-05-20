package com.aurex.backend.portfolio.service;

import com.aurex.backend.common.exception.InsufficientHoldingException;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.service.MarketDataService;
import com.aurex.backend.portfolio.dto.HoldingResponse;
import com.aurex.backend.portfolio.entity.Holding;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.entity.TransactionType;
import com.aurex.backend.portfolio.mapper.HoldingMapper;
import com.aurex.backend.portfolio.repository.HoldingRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HoldingService {

    private static final int QUANTITY_SCALE = 8;
    private static final int PRICE_SCALE = 4;

    private final HoldingRepository holdingRepository;
    private final MarketDataService marketDataService;

    @Transactional(readOnly = true)
    public List<HoldingResponse> listByPortfolio(Portfolio portfolio) {
        return holdingRepository.findByPortfolioIdWithAssetOrderByAssetSymbolAsc(portfolio.getId()).stream()
                .map(this::toResponseWithLatestPrice)
                .toList();
    }

    @Transactional
    public void applyBuy(Portfolio portfolio, Asset asset, BigDecimal quantity, BigDecimal price) {
        BigDecimal normalizedQty = normalizeQuantity(quantity);
        BigDecimal normalizedPrice = normalizePrice(price);

        Holding holding =
                holdingRepository
                        .findByPortfolioIdAndAssetId(portfolio.getId(), asset.getId())
                        .orElseGet(
                                () ->
                                        Holding.builder()
                                                .portfolio(portfolio)
                                                .asset(asset)
                                                .quantity(BigDecimal.ZERO)
                                                .averageBuyPrice(BigDecimal.ZERO)
                                                .build());

        BigDecimal previousQty = holding.getQuantity();
        BigDecimal previousCost = previousQty.multiply(holding.getAverageBuyPrice());
        BigDecimal purchaseCost = normalizedQty.multiply(normalizedPrice);
        BigDecimal newQty = previousQty.add(normalizedQty);

        BigDecimal newAverage =
                newQty.compareTo(BigDecimal.ZERO) == 0
                        ? BigDecimal.ZERO
                        : previousCost
                                .add(purchaseCost)
                                .divide(newQty, PRICE_SCALE, RoundingMode.HALF_UP);

        holding.setQuantity(newQty);
        holding.setAverageBuyPrice(newAverage);
        holdingRepository.save(holding);
    }

    @Transactional
    public void applySell(Portfolio portfolio, Asset asset, BigDecimal quantity) {
        BigDecimal normalizedQty = normalizeQuantity(quantity);

        Holding holding =
                holdingRepository
                        .findByPortfolioIdAndAssetId(portfolio.getId(), asset.getId())
                        .orElseThrow(
                                () ->
                                        new InsufficientHoldingException(
                                                "No holding available for asset: " + asset.getSymbol()));

        if (holding.getQuantity().compareTo(normalizedQty) < 0) {
            throw new InsufficientHoldingException(
                    "Insufficient quantity for asset "
                            + asset.getSymbol()
                            + ". Available: "
                            + holding.getQuantity()
                            + ", requested: "
                            + normalizedQty);
        }

        BigDecimal newQty = holding.getQuantity().subtract(normalizedQty);

        if (newQty.compareTo(BigDecimal.ZERO) == 0) {
            holdingRepository.delete(holding);
            return;
        }

        holding.setQuantity(newQty);
        holdingRepository.save(holding);
    }

    @Transactional
    public void applyTransaction(
            Portfolio portfolio, Asset asset, TransactionType type, BigDecimal quantity, BigDecimal price) {
        if (type == TransactionType.BUY) {
            applyBuy(portfolio, asset, quantity, price);
        } else if (type == TransactionType.SELL) {
            applySell(portfolio, asset, quantity);
        } else {
            throw new IllegalArgumentException("Unsupported transaction type: " + type);
        }
    }

    @Transactional
    public void deleteAllForPortfolio(UUID portfolioId) {
        holdingRepository.deleteByPortfolioId(portfolioId);
    }

    private HoldingResponse toResponseWithLatestPrice(Holding holding) {
        BigDecimal currentPrice =
                marketDataService
                        .resolveCurrentPrice(holding.getAsset(), holding.getAverageBuyPrice())
                        .price();
        return HoldingMapper.toResponse(holding, currentPrice);
    }

    static BigDecimal normalizeQuantity(BigDecimal quantity) {
        return quantity.setScale(QUANTITY_SCALE, RoundingMode.HALF_UP);
    }

    static BigDecimal normalizePrice(BigDecimal price) {
        return price.setScale(PRICE_SCALE, RoundingMode.HALF_UP);
    }
}
