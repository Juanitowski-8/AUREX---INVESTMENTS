package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.market")
public class MarketProperties {

    /** Active provider: mock | coingecko */
    private String provider = "mock";

    private boolean persistSnapshotsOnRead = false;

    private int defaultHistoryDays = 30;

    private boolean cacheEnabled = true;

    /** TTL for market ticker/history cache entries (seconds). */
    private int cacheTtlSeconds = 60;
}
