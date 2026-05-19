-- Aurex — AI portfolio analysis (educational, mock phase)

CREATE TABLE ai_analyses (
    id                  UUID PRIMARY KEY,
    portfolio_id        UUID         NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
    summary             TEXT         NOT NULL,
    risk_level          VARCHAR(16)  NOT NULL,
    concentration_notes TEXT         NOT NULL,
    observations        TEXT         NOT NULL,
    disclaimer          VARCHAR(1000) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_analyses_portfolio_id ON ai_analyses (portfolio_id);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses (created_at);
