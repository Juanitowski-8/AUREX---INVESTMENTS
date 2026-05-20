package com.aurex.backend.alert.service;

import com.aurex.backend.alert.dto.AlertCreateRequest;
import com.aurex.backend.alert.dto.AlertEventResponse;
import com.aurex.backend.alert.dto.AlertResponse;
import com.aurex.backend.alert.dto.AlertUpdateRequest;
import com.aurex.backend.alert.entity.AlertRule;
import com.aurex.backend.alert.mapper.AlertMapper;
import com.aurex.backend.alert.repository.AlertEventRepository;
import com.aurex.backend.alert.repository.AlertRuleRepository;
import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.common.security.AuthenticatedUserProvider;
import com.aurex.backend.market.entity.Asset;
import com.aurex.backend.market.service.AssetService;
import com.aurex.backend.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertEventRepository alertEventRepository;
    private final AssetService assetService;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Transactional(readOnly = true)
    public List<AlertResponse> listForCurrentUser() {
        User user = authenticatedUserProvider.getCurrentUser();
        return alertRuleRepository.findByUserIdWithAssetOrderByCreatedAtDesc(user.getId()).stream()
                .map(AlertMapper::toResponse)
                .toList();
    }

    @Transactional
    public AlertResponse create(AlertCreateRequest request) {
        User user = authenticatedUserProvider.getCurrentUser();
        Asset asset = assetService.findActiveBySymbol(request.assetSymbol());

        AlertRule rule =
                AlertRule.builder()
                        .user(user)
                        .asset(asset)
                        .conditionType(request.conditionType())
                        .targetPrice(normalizePrice(request.targetPrice()))
                        .enabled(true)
                        .build();

        AlertRule saved = alertRuleRepository.save(rule);
        return AlertMapper.toResponse(saved);
    }

    @Transactional
    public AlertResponse update(UUID id, AlertUpdateRequest request) {
        AlertRule rule = findOwnedRule(id);
        rule.setConditionType(request.conditionType());
        rule.setTargetPrice(normalizePrice(request.targetPrice()));
        return AlertMapper.toResponse(rule);
    }

    @Transactional
    public AlertResponse toggle(UUID id) {
        AlertRule rule = findOwnedRule(id);
        rule.setEnabled(!rule.isEnabled());
        return AlertMapper.toResponse(rule);
    }

    @Transactional
    public void delete(UUID id) {
        AlertRule rule = findOwnedRule(id);
        alertRuleRepository.delete(rule);
    }

    @Transactional(readOnly = true)
    public List<AlertEventResponse> listEventsForCurrentUser() {
        User user = authenticatedUserProvider.getCurrentUser();
        return alertEventRepository.findByUserIdOrderByTriggeredAtDesc(user.getId()).stream()
                .map(AlertMapper::toEventResponse)
                .toList();
    }

    private AlertRule findOwnedRule(UUID id) {
        User user = authenticatedUserProvider.getCurrentUser();
        return alertRuleRepository
                .findByIdAndUserIdWithAsset(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
    }

    private static BigDecimal normalizePrice(BigDecimal price) {
        return price.setScale(4, RoundingMode.HALF_UP);
    }
}
