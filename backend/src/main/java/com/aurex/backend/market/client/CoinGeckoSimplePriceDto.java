package com.aurex.backend.market.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CoinGeckoSimplePriceDto(
        @JsonProperty("usd") BigDecimal usd,
        @JsonProperty("usd_24h_change") BigDecimal usd24hChange,
        @JsonProperty("usd_market_cap") BigDecimal usdMarketCap,
        @JsonProperty("usd_24h_vol") BigDecimal usd24hVol) {}
