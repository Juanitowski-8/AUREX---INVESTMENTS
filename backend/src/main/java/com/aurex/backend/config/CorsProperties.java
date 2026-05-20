package com.aurex.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aurex.cors")
public class CorsProperties {

    /** Comma-separated origins, e.g. http://localhost:3000 */
    private String allowedOrigins = "http://localhost:3000";
}
