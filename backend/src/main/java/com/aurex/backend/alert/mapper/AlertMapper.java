package com.aurex.backend.alert.mapper;

import com.aurex.backend.alert.dto.AlertEventResponse;
import com.aurex.backend.alert.dto.AlertResponse;
import com.aurex.backend.alert.entity.AlertEvent;
import com.aurex.backend.alert.entity.AlertRule;

public final class AlertMapper {

    private AlertMapper() {}

    public static AlertResponse toResponse(AlertRule rule) {
        return new AlertResponse(
                rule.getId(),
                rule.getAsset().getSymbol(),
                rule.getAsset().getName(),
                rule.getConditionType(),
                rule.getTargetPrice(),
                rule.isEnabled(),
                rule.getCreatedAt(),
                rule.getUpdatedAt());
    }

    public static AlertEventResponse toEventResponse(AlertEvent event) {
        AlertRule rule = event.getAlertRule();
        return new AlertEventResponse(
                event.getId(),
                rule.getId(),
                rule.getAsset().getSymbol(),
                rule.getAsset().getName(),
                event.getTriggeredPrice(),
                event.getMessage(),
                event.getTriggeredAt(),
                event.isRead());
    }
}
