package com.aurex.backend.market.repository;

import com.aurex.backend.market.entity.PriceSnapshot;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, UUID> {

    Optional<PriceSnapshot> findFirstByAssetIdOrderByCapturedAtDesc(UUID assetId);

    List<PriceSnapshot> findByAssetIdOrderByCapturedAtDesc(UUID assetId);
}
