package com.aurex.backend.alert.job;

import com.aurex.backend.alert.service.AlertEvaluationService;
import com.aurex.backend.config.AlertProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "aurex.alerts.evaluation-enabled", havingValue = "true", matchIfMissing = true)
public class AlertEvaluationJob {

    private final AlertEvaluationService alertEvaluationService;
    private final AlertProperties alertProperties;

    @Scheduled(fixedDelayString = "${aurex.alerts.evaluation-interval-ms:60000}")
    public void evaluateAlerts() {
        if (!alertProperties.isEvaluationEnabled()) {
            return;
        }

        try {
            alertEvaluationService.evaluateActiveAlerts();
        } catch (Exception ex) {
            log.error("Alert evaluation job failed", ex);
        }
    }
}
