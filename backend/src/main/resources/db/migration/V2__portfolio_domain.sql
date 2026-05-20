-- Aurex — simulated portfolios domain

CREATE TABLE assets (
    id              UUID PRIMARY KEY,
    symbol          VARCHAR(32)  NOT NULL,
    name            VARCHAR(255) NOT NULL,
    asset_type      VARCHAR(32)  NOT NULL,
    external_id     VARCHAR(128),
    source          VARCHAR(64),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_assets_symbol_type UNIQUE (symbol, asset_type)
);

CREATE INDEX idx_assets_symbol ON assets (symbol);

CREATE TABLE portfolios (
    id              UUID PRIMARY KEY,
    user_id         UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    base_currency   VARCHAR(8)   NOT NULL DEFAULT 'USD',
    description     VARCHAR(1000),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);

CREATE TABLE holdings (
    id                  UUID PRIMARY KEY,
    portfolio_id        UUID           NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
    asset_id            UUID           NOT NULL REFERENCES assets (id) ON DELETE RESTRICT,
    quantity            DECIMAL(28, 8) NOT NULL,
    average_buy_price   DECIMAL(19, 4) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_holdings_portfolio_asset UNIQUE (portfolio_id, asset_id)
);

CREATE INDEX idx_holdings_portfolio_id ON holdings (portfolio_id);

CREATE TABLE transactions (
    id                  UUID PRIMARY KEY,
    portfolio_id        UUID           NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
    asset_id            UUID           NOT NULL REFERENCES assets (id) ON DELETE RESTRICT,
    type                VARCHAR(16)    NOT NULL,
    quantity            DECIMAL(28, 8) NOT NULL,
    price               DECIMAL(19, 4) NOT NULL,
    transaction_date    TIMESTAMP WITH TIME ZONE NOT NULL,
    notes               VARCHAR(1000),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_portfolio_id ON transactions (portfolio_id);

CREATE TABLE price_snapshots (
    id              UUID PRIMARY KEY,
    asset_id        UUID           NOT NULL REFERENCES assets (id) ON DELETE CASCADE,
    price           DECIMAL(19, 4) NOT NULL,
    currency        VARCHAR(8)     NOT NULL,
    source          VARCHAR(64)    NOT NULL,
    captured_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_price_snapshots_asset_id ON price_snapshots (asset_id);
