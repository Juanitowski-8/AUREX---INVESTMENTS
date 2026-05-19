package com.aurex.backend.market.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CoinGeckoMarketChartDto(List<List<Number>> prices) {}
