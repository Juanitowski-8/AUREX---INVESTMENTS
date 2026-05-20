package com.aurex.backend.alert.controller;

import com.aurex.backend.alert.dto.AlertCreateRequest;
import com.aurex.backend.alert.dto.AlertEventResponse;
import com.aurex.backend.alert.dto.AlertResponse;
import com.aurex.backend.alert.dto.AlertUpdateRequest;
import com.aurex.backend.alert.service.AlertService;
import com.aurex.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(alertService.listForCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AlertResponse>> create(
            @Valid @RequestBody AlertCreateRequest request) {
        AlertResponse response = alertService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody AlertUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(alertService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<AlertResponse>> toggle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(alertService.toggle(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        alertService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<AlertEventResponse>>> listEvents() {
        return ResponseEntity.ok(ApiResponse.ok(alertService.listEventsForCurrentUser()));
    }
}
