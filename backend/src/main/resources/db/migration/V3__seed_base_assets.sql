-- Aurex — base catalog assets (fixed UUIDs for stable references)

INSERT INTO assets (id, symbol, name, asset_type, external_id, source, active, created_at, updated_at)
VALUES
    ('a1000001-0000-4000-8000-000000000001', 'BTC',  'Bitcoin',     'CRYPTO', 'bitcoin',  'coingecko', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000002', 'ETH',  'Ethereum',    'CRYPTO', 'ethereum', 'coingecko', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000003', 'SOL',  'Solana',      'CRYPTO', 'solana',   'coingecko', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000004', 'AAPL', 'Apple',       'STOCK',  NULL,       'manual',    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000005', 'NVDA', 'NVIDIA',      'STOCK',  NULL,       'manual',    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000006', 'TSLA', 'Tesla',       'STOCK',  NULL,       'manual',    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000007', 'SPY',  'S&P 500 ETF', 'ETF',    NULL,       'manual',    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
