-- Aurex — additional catalog assets (AVAX, ADA)

INSERT INTO assets (id, symbol, name, asset_type, external_id, source, active, created_at, updated_at)
VALUES
    ('a1000001-0000-4000-8000-000000000008', 'AVAX', 'Avalanche', 'CRYPTO', 'avalanche-2', 'coingecko', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1000001-0000-4000-8000-000000000009', 'ADA',  'Cardano',   'CRYPTO', 'cardano',     'coingecko', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
