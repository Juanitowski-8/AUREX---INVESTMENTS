package com.aurex.backend.market.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ResolvedPrice(BigDecimal price, Instant asOf, boolean fromSnapshot) {}
