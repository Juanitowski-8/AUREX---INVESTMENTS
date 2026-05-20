-- Aurex — financial alert rules and triggered events

CREATE TABLE alert_rules (
    id              UUID PRIMARY KEY,
    user_id         UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    asset_id        UUID           NOT NULL REFERENCES assets (id) ON DELETE RESTRICT,
    condition_type  VARCHAR(16)    NOT NULL,
    target_price    DECIMAL(19, 4) NOT NULL,
    enabled         BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_user_id ON alert_rules (user_id);
CREATE INDEX idx_alert_rules_asset_id ON alert_rules (asset_id);
CREATE INDEX idx_alert_rules_enabled ON alert_rules (enabled);

CREATE TABLE alert_events (
    id               UUID PRIMARY KEY,
    alert_rule_id    UUID           NOT NULL REFERENCES alert_rules (id) ON DELETE CASCADE,
    triggered_price  DECIMAL(19, 4) NOT NULL,
    message          VARCHAR(1000)  NOT NULL,
    triggered_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    read_flag        BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_alert_events_alert_rule_id ON alert_events (alert_rule_id);
CREATE INDEX idx_alert_events_triggered_at ON alert_events (triggered_at);
