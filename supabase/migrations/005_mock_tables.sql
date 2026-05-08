-- Mock shadow tables for demo/preview mode (no RLS, no real data)
CREATE TABLE IF NOT EXISTS documents_mock (LIKE documents INCLUDING ALL);
CREATE TABLE IF NOT EXISTS chunks_mock (LIKE chunks INCLUDING ALL);
CREATE TABLE IF NOT EXISTS conversations_mock (LIKE conversations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS messages_mock (LIKE messages INCLUDING ALL);
CREATE TABLE IF NOT EXISTS api_keys_mock (LIKE api_keys INCLUDING ALL);

-- Reseed on each run
TRUNCATE documents_mock, chunks_mock, conversations_mock, messages_mock, api_keys_mock;

-- Acme org mock documents
INSERT INTO documents_mock (id, org_id, title, source_type, status, content, created_at) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'FAQ Prodotto', 'markdown', 'ready', '# FAQ prodotto Acme Corp', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Politica di Rimborso', 'pdf', 'ready', 'Rimborsi entro 30 giorni dalla data di acquisto.', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Guida Tecnica API', 'markdown', 'ready', '# API Reference\n\nAuthentication via Bearer token.', NOW() - INTERVAL '1 day');

-- Acme org mock API keys
INSERT INTO api_keys_mock (id, org_id, name, key_hash, created_at) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'Production Key', 'mock_hash_prod_1', NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'Dev Key', 'mock_hash_dev_1', NOW() - INTERVAL '2 days');

-- Acme org mock conversations
INSERT INTO conversations_mock (id, org_id, started_at) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 hours'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days');

-- Mock messages for conversations
INSERT INTO messages_mock (id, conversation_id, role, content, tokens_used, cost_cents, created_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', 'user', 'Come funziona il rimborso?', NULL, NULL, NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000001', 'assistant', 'I rimborsi vengono elaborati entro 30 giorni dalla data di acquisto.', 120, 2, NOW() - INTERVAL '55 minutes'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000002', 'user', 'Come integro l''API?', NULL, NULL, NOW() - INTERVAL '3 hours'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0002-000000000002', 'assistant', 'Utilizza un Bearer token nell''header Authorization.', 98, 2, NOW() - INTERVAL '175 minutes');
