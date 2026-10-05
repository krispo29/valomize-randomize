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

-- -----------------------------------------------------
-- Live Room Members & Presence Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS room_members (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_name TEXT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  slot_index INTEGER,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_members_code ON room_members (room_code);
CREATE INDEX IF NOT EXISTS idx_room_members_seen ON room_members (last_seen DESC);

-- -----------------------------------------------------
-- Room Persisted State (For Late Joiners)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS room_states (
  room_code TEXT PRIMARY KEY,
  state_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample query to check records:
-- SELECT * FROM matches ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM room_members WHERE last_seen > NOW() - INTERVAL '30 seconds';
-- SELECT * FROM room_states;
