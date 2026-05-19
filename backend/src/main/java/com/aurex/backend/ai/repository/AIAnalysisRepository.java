package com.aurex.backend.ai.repository;

import com.aurex.backend.ai.entity.AIAnalysis;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, UUID> {

    @Query(
            """
            SELECT a FROM AIAnalysis a
            JOIN FETCH a.portfolio
            WHERE a.portfolio.user.id = :userId
            ORDER BY a.createdAt DESC
            """)
    List<AIAnalysis> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query(
            """
            SELECT a FROM AIAnalysis a
            JOIN FETCH a.portfolio
            WHERE a.id = :id AND a.portfolio.user.id = :userId
            """)
    Optional<AIAnalysis> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
