package com.aurex.backend.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private final boolean success = false;
    private final String code;
    private final String message;
    private final Map<String, String> fieldErrors;
    private final Instant timestamp;

    public static ApiError of(String code, String message) {
        return ApiError.builder()
                .code(code)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiError validation(String message, Map<String, String> fieldErrors) {
        return ApiError.builder()
                .code("VALIDATION_ERROR")
                .message(message)
                .fieldErrors(fieldErrors)
                .timestamp(Instant.now())
                .build();
    }
}
