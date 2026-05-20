package com.aurex.backend.portfolio.repository;

import com.aurex.backend.portfolio.entity.Portfolio;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {

    List<Portfolio> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<Portfolio> findByIdAndUser_Id(UUID id, UUID userId);
}
