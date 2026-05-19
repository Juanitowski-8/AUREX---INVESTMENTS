package com.aurex.backend.market.controller;

import com.aurex.backend.common.response.ApiResponse;
import com.aurex.backend.market.dto.AssetResponse;
import com.aurex.backend.market.service.AssetService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(assetService.listActive()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> search(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.search(query)));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<AssetResponse>> getBySymbol(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.getBySymbol(symbol)));
    }
}
