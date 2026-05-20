package com.aurex.backend.common.exception;

public class InvalidPasswordResetException extends RuntimeException {

    public InvalidPasswordResetException() {
        super("Invalid or expired password reset token");
    }
}
