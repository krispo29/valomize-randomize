-- =====================================================
-- Valomize Randomizer - Neon Serverless Postgres Schema
-- Run this in your Neon SQL Editor (Console > SQL Editor)
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  room_code TEXT,
  map TEXT NOT NULL,
  result TEXT NOT NULL,
  score_team INTEGER DEFAULT 0,
  score_enemy INTEGER DEFAULT 0,
  match_mvp TEXT,
  notes TEXT,
  players JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize queries by date and room
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_room_code ON matches (room_code);

-- Sample query to check records:
-- SELECT * FROM matches ORDER BY created_at DESC LIMIT 10;
