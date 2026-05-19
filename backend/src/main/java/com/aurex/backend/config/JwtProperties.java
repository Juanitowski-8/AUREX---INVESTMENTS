package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.jwt")
public class JwtProperties {

    /** HS256 secret — must be overridden in production via JWT_SECRET */
    private String secret;

    private long expirationMs = 86_400_000L;
}
