package com.aurex.backend.market.controller;

import com.aurex.backend.common.response.ApiResponse;
import com.aurex.backend.market.dto.MarketAssetResponse;
import com.aurex.backend.market.dto.MarketHistoryPointResponse;
import com.aurex.backend.market.dto.MarketTickerResponse;
import com.aurex.backend.market.service.MarketDataService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/ticker")
    public ResponseEntity<ApiResponse<List<MarketTickerResponse>>> ticker(
            @RequestParam String symbols) {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getTicker(symbols)));
    }

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<List<MarketAssetResponse>>> assets() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.listMarketAssets()));
    }

    @GetMapping("/history/{symbol}")
    public ResponseEntity<ApiResponse<List<MarketHistoryPointResponse>>> history(
            @PathVariable String symbol, @RequestParam(required = false) Integer days) {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getHistory(symbol, days)));
    }
}
