package com.aurex.backend.auth.dto;

/** {@code resetToken} is set when the email exists (email delivery can be added later). */
public record ForgotPasswordResponse(String message, String resetToken) {}
