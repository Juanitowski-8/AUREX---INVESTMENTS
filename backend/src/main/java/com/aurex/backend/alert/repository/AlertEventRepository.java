package com.aurex.backend.alert.repository;

import com.aurex.backend.alert.entity.AlertEvent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AlertEventRepository extends JpaRepository<AlertEvent, UUID> {

    @Query(
            """
            SELECT e FROM AlertEvent e
            JOIN FETCH e.alertRule r
            JOIN FETCH r.asset
            WHERE r.user.id = :userId
            ORDER BY e.triggeredAt DESC
            """)
    List<AlertEvent> findByUserIdOrderByTriggeredAtDesc(@Param("userId") UUID userId);
}
