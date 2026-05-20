package com.aurex.backend.alert.service;

import com.aurex.backend.alert.entity.AlertEvent;
import com.aurex.backend.alert.entity.AlertRule;
import com.aurex.backend.alert.entity.ConditionType;
import com.aurex.backend.alert.repository.AlertEventRepository;
import com.aurex.backend.alert.repository.AlertRuleRepository;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.service.MarketDataService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertEvaluationService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertEventRepository alertEventRepository;
    private final MarketDataService marketDataService;

    @Transactional
    public int evaluateActiveAlerts() {
        List<AlertRule> rules = alertRuleRepository.findAllEnabledWithAsset();
        int triggeredCount = 0;

        for (AlertRule rule : rules) {
            try {
                if (evaluateRule(rule)) {
                    triggeredCount++;
                }
            } catch (Exception ex) {
                log.error(
                        "Failed to evaluate alert rule id={} symbol={}",
                        rule.getId(),
                        rule.getAsset().getSymbol(),
                        ex);
            }
        }

        if (!rules.isEmpty()) {
            log.debug(
                    "Alert evaluation finished: checked={}, triggered={}",
                    rules.size(),
                    triggeredCount);
        }

        return triggeredCount;
    }

    /**
     * @return true if the alert was triggered and an event was created
     */
    private boolean evaluateRule(AlertRule rule) {
        Asset asset = rule.getAsset();
        Optional<BigDecimal> currentPriceOpt = marketDataService.getCurrentPrice(asset);

        if (currentPriceOpt.isEmpty()) {
            log.warn(
                    "Skipping alert rule id={} — no current price for {}",
                    rule.getId(),
                    asset.getSymbol());
            return false;
        }

        BigDecimal currentPrice = currentPriceOpt.get();
        if (!isConditionMet(rule.getConditionType(), currentPrice, rule.getTargetPrice())) {
            return false;
        }

        String message = buildMessage(rule, currentPrice);
        Instant now = Instant.now();

        alertEventRepository.save(
                AlertEvent.builder()
                        .alertRule(rule)
                        .triggeredPrice(currentPrice)
                        .message(message)
                        .triggeredAt(now)
                        .read(false)
                        .build());

        rule.setEnabled(false);

        log.info(
                "Alert triggered: ruleId={} symbol={} condition={} targetPrice={} triggeredPrice={}",
                rule.getId(),
                asset.getSymbol(),
                rule.getConditionType(),
                rule.getTargetPrice(),
                currentPrice);

        return true;
    }

    static boolean isConditionMet(
            ConditionType conditionType, BigDecimal currentPrice, BigDecimal targetPrice) {
        return switch (conditionType) {
            case ABOVE -> currentPrice.compareTo(targetPrice) >= 0;
            case BELOW -> currentPrice.compareTo(targetPrice) <= 0;
        };
    }

    private static String buildMessage(AlertRule rule, BigDecimal currentPrice) {
        String symbol = rule.getAsset().getSymbol();
        return switch (rule.getConditionType()) {
            case ABOVE ->
                    "%s price is at or above %s USD (target %s USD)"
                            .formatted(symbol, currentPrice, rule.getTargetPrice());
            case BELOW ->
                    "%s price is at or below %s USD (target %s USD)"
                            .formatted(symbol, currentPrice, rule.getTargetPrice());
        };
    }
}
