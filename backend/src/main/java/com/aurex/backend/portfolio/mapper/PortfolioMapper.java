package com.aurex.backend.portfolio.mapper;

import com.aurex.backend.portfolio.dto.PortfolioResponse;
import com.aurex.backend.portfolio.entity.Portfolio;

public final class PortfolioMapper {

    private PortfolioMapper() {}

    public static PortfolioResponse toResponse(Portfolio portfolio) {
        return new PortfolioResponse(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getBaseCurrency(),
                portfolio.getDescription(),
                portfolio.getCreatedAt(),
                portfolio.getUpdatedAt());
    }
}
