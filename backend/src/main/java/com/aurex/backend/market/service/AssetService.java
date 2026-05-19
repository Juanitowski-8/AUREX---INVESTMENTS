package com.aurex.backend.market.service;

import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.market.dto.AssetResponse;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.mapper.AssetMapper;
import com.aurex.backend.market.repository.AssetRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Catalog of tradable assets (seeded locally). {@link MarketDataService} will use this layer
 * to resolve assets before fetching external market prices in a later phase.
 */
@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    @Transactional(readOnly = true)
    public List<AssetResponse> listActive() {
        return assetRepository.findByActiveTrueOrderBySymbolAsc().stream()
                .map(AssetMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> search(String query) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isEmpty()) {
            return listActive();
        }
        return assetRepository.search(normalized).stream()
                .map(AssetMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssetResponse getBySymbol(String symbol) {
        return AssetMapper.toResponse(findActiveBySymbol(symbol));
    }

    /**
     * Resolves an active asset by symbol for internal use (e.g. future market data lookups).
     */
    @Transactional(readOnly = true)
    public Asset findActiveBySymbol(String symbol) {
        return assetRepository
                .findBySymbolIgnoreCase(symbol.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + symbol));
    }
}
