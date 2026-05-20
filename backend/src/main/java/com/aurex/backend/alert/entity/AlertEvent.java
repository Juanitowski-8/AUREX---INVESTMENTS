package com.aurex.backend.alert.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "alert_events")
public class AlertEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alert_rule_id", nullable = false)
    private AlertRule alertRule;

    @Column(name = "triggered_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal triggeredPrice;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "triggered_at", nullable = false)
    private Instant triggeredAt;

    @Column(name = "read_flag", nullable = false)
    private boolean read;

    @PrePersist
    void onCreate() {
        if (triggeredAt == null) {
            triggeredAt = Instant.now();
        }
    }
}
