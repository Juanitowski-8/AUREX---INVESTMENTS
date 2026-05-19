package com.aurex.backend.portfolio.repository;

import com.aurex.backend.portfolio.entity.Holding;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HoldingRepository extends JpaRepository<Holding, UUID> {

    List<Holding> findByPortfolioId(UUID portfolioId);

    Optional<Holding> findByPortfolioIdAndAssetId(UUID portfolioId, UUID assetId);

    @Query(
            """
            SELECT h FROM Holding h
            JOIN FETCH h.asset
            WHERE h.portfolio.id = :portfolioId
            ORDER BY h.asset.symbol ASC
            """)
    List<Holding> findByPortfolioIdWithAssetOrderByAssetSymbolAsc(
            @Param("portfolioId") UUID portfolioId);

    @Modifying
    @Query("DELETE FROM Holding h WHERE h.portfolio.id = :portfolioId")
    void deleteByPortfolioId(@Param("portfolioId") UUID portfolioId);
}
