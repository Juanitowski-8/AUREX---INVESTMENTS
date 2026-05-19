package com.aurex.backend.alert.repository;

import com.aurex.backend.alert.entity.AlertRule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {

    @Query(
            """
            SELECT r FROM AlertRule r
            JOIN FETCH r.asset
            WHERE r.user.id = :userId
            ORDER BY r.createdAt DESC
            """)
    List<AlertRule> findByUserIdWithAssetOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query(
            """
            SELECT r FROM AlertRule r
            JOIN FETCH r.asset
            WHERE r.id = :id AND r.user.id = :userId
            """)
    Optional<AlertRule> findByIdAndUserIdWithAsset(
            @Param("id") UUID id, @Param("userId") UUID userId);

    @Query(
            """
            SELECT r FROM AlertRule r
            JOIN FETCH r.asset
            WHERE r.enabled = true
            """)
    List<AlertRule> findAllEnabledWithAsset();
}
