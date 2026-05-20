package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.alerts")
public class AlertProperties {

    private boolean evaluationEnabled = true;

    private long evaluationIntervalMs = 60_000L;
}
