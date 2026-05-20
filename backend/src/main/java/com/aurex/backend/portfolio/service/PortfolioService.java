package com.aurex.backend.portfolio.service;

import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.common.security.AuthenticatedUserProvider;
import com.aurex.backend.portfolio.dto.PortfolioCreateRequest;
import com.aurex.backend.portfolio.dto.PortfolioResponse;
import com.aurex.backend.portfolio.dto.PortfolioUpdateRequest;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.mapper.PortfolioMapper;
import com.aurex.backend.portfolio.repository.PortfolioRepository;
import com.aurex.backend.user.entity.User;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private static final String DEFAULT_CURRENCY = "USD";

    private final PortfolioRepository portfolioRepository;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Transactional(readOnly = true)
    public List<PortfolioResponse> listForCurrentUser() {
        User user = authenticatedUserProvider.getCurrentUser();
        return portfolioRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(PortfolioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getById(UUID id) {
        User user = authenticatedUserProvider.getCurrentUser();
        Portfolio portfolio = findOwnedPortfolio(id, user.getId());
        return PortfolioMapper.toResponse(portfolio);
    }

    @Transactional
    public PortfolioResponse create(PortfolioCreateRequest request) {
        User user = authenticatedUserProvider.getCurrentUser();

        Portfolio portfolio =
                Portfolio.builder()
                        .user(user)
                        .name(request.name().trim())
                        .baseCurrency(resolveBaseCurrency(request.baseCurrency()))
                        .description(normalizeDescription(request.description()))
                        .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        return PortfolioMapper.toResponse(saved);
    }

    @Transactional
    public PortfolioResponse update(UUID id, PortfolioUpdateRequest request) {
        User user = authenticatedUserProvider.getCurrentUser();
        Portfolio portfolio = findOwnedPortfolio(id, user.getId());

        portfolio.setName(request.name().trim());
        portfolio.setBaseCurrency(resolveBaseCurrency(request.baseCurrency()));
        portfolio.setDescription(normalizeDescription(request.description()));

        return PortfolioMapper.toResponse(portfolio);
    }

    @Transactional
    public void delete(UUID id) {
        User user = authenticatedUserProvider.getCurrentUser();
        Portfolio portfolio = findOwnedPortfolio(id, user.getId());
        portfolioRepository.delete(portfolio);
    }

    @Transactional(readOnly = true)
    public Portfolio getOwnedPortfolio(UUID portfolioId) {
        User user = authenticatedUserProvider.getCurrentUser();
        return findOwnedPortfolio(portfolioId, user.getId());
    }

    private Portfolio findOwnedPortfolio(UUID portfolioId, UUID userId) {
        return portfolioRepository
                .findByIdAndUser_Id(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
    }

    private static String resolveBaseCurrency(String baseCurrency) {
        if (baseCurrency == null || baseCurrency.isBlank()) {
            return DEFAULT_CURRENCY;
        }
        return baseCurrency.trim().toUpperCase();
    }

    private static String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }
}
