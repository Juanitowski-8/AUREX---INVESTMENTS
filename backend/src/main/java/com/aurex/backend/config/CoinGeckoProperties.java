package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.market.coingecko")
public class CoinGeckoProperties {

    private String baseUrl = "https://api.coingecko.com/api/v3";

    private int timeoutSeconds = 10;
}
