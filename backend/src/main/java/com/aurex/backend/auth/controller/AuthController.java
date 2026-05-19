package com.aurex.backend.auth.controller;

import com.aurex.backend.auth.dto.AuthResponse;
import com.aurex.backend.auth.dto.CurrentUserResponse;
import com.aurex.backend.auth.dto.ForgotPasswordRequest;
import com.aurex.backend.auth.dto.ForgotPasswordResponse;
import com.aurex.backend.auth.dto.LoginRequest;
import com.aurex.backend.auth.dto.RegisterRequest;
import com.aurex.backend.auth.dto.ResetPasswordRequest;
import com.aurex.backend.auth.dto.UpdateProfileRequest;
import com.aurex.backend.auth.service.AuthService;
import com.aurex.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> me() {
        CurrentUserResponse user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> updateMe(
            @Valid @RequestBody UpdateProfileRequest request) {
        CurrentUserResponse user = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.okMessage("Password updated successfully"));
    }
}
