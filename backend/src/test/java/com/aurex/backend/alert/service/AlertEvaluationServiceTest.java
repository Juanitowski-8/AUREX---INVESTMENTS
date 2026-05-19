package com.aurex.backend.alert.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aurex.backend.alert.entity.AlertEvent;
import com.aurex.backend.alert.entity.AlertRule;
import com.aurex.backend.alert.entity.ConditionType;
import com.aurex.backend.alert.repository.AlertEventRepository;
import com.aurex.backend.alert.repository.AlertRuleRepository;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.entity.AssetType;
import com.aurex.backend.market.service.MarketDataService;
import com.aurex.backend.user.entity.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlertEvaluationServiceTest {

    @Mock private AlertRuleRepository alertRuleRepository;

    @Mock private AlertEventRepository alertEventRepository;

    @Mock private MarketDataService marketDataService;

    @InjectMocks private AlertEvaluationService alertEvaluationService;

    @Test
    void triggersAboveAlertAndDisablesRule() {
        User user = User.builder().id(UUID.randomUUID()).email("u@test.com").build();
        Asset btc =
                Asset.builder()
                        .symbol("BTC")
                        .name("Bitcoin")
                        .assetType(AssetType.CRYPTO)
                        .externalId("bitcoin")
                        .active(true)
                        .build();

        AlertRule rule =
                AlertRule.builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .asset(btc)
                        .conditionType(ConditionType.ABOVE)
                        .targetPrice(new BigDecimal("70000"))
                        .enabled(true)
                        .build();

        when(alertRuleRepository.findAllEnabledWithAsset()).thenReturn(List.of(rule));
        when(marketDataService.getCurrentPrice(btc)).thenReturn(Optional.of(new BigDecimal("71000")));

        int triggered = alertEvaluationService.evaluateActiveAlerts();

        assertThat(triggered).isEqualTo(1);
        assertThat(rule.isEnabled()).isFalse();

        ArgumentCaptor<AlertEvent> captor = ArgumentCaptor.forClass(AlertEvent.class);
        verify(alertEventRepository).save(captor.capture());
        assertThat(captor.getValue().getTriggeredPrice()).isEqualByComparingTo("71000");
        assertThat(captor.getValue().getMessage()).contains("BTC");
    }

    @Test
    void doesNotTriggerWhenConditionNotMet() {
        Asset eth =
                Asset.builder().symbol("ETH").name("Ethereum").assetType(AssetType.CRYPTO).build();
        AlertRule rule =
                AlertRule.builder()
                        .asset(eth)
                        .conditionType(ConditionType.BELOW)
                        .targetPrice(new BigDecimal("3000"))
                        .enabled(true)
                        .build();

        when(alertRuleRepository.findAllEnabledWithAsset()).thenReturn(List.of(rule));
        when(marketDataService.getCurrentPrice(eth)).thenReturn(Optional.of(new BigDecimal("3500")));

        int triggered = alertEvaluationService.evaluateActiveAlerts();

        assertThat(triggered).isZero();
        assertThat(rule.isEnabled()).isTrue();
        verify(alertEventRepository, never()).save(any());
    }

    @Test
    void conditionMetLogic() {
        assertThat(
                        AlertEvaluationService.isConditionMet(
                                ConditionType.ABOVE,
                                new BigDecimal("70001"),
                                new BigDecimal("70000")))
                .isTrue();
        assertThat(
                        AlertEvaluationService.isConditionMet(
                                ConditionType.BELOW,
                                new BigDecimal("2999"),
                                new BigDecimal("3000")))
                .isTrue();
    }
}
