package com.aurex.backend.market.repository;

import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.AssetType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssetRepository extends JpaRepository<Asset, UUID> {

    Optional<Asset> findBySymbolIgnoreCaseAndAssetType(String symbol, AssetType assetType);

    boolean existsBySymbolIgnoreCaseAndAssetType(String symbol, AssetType assetType);

    List<Asset> findByActiveTrueOrderBySymbolAsc();

    @Query(
            """
            SELECT a FROM Asset a
            WHERE a.active = true AND LOWER(a.symbol) = LOWER(:symbol)
            """)
    Optional<Asset> findBySymbolIgnoreCase(@Param("symbol") String symbol);

    @Query(
            """
            SELECT a FROM Asset a
            WHERE a.active = true
              AND (
                  LOWER(a.symbol) LIKE LOWER(CONCAT('%', :query, '%'))
                  OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%'))
              )
            ORDER BY a.symbol ASC
            """)
    List<Asset> search(@Param("query") String query);
}
