import { neon } from '@neondatabase/serverless';

// Helper to set CORS headers
function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// Auto-initialize table schema if needed
let tableInitialized = false;
async function ensureMatchesTable(sql: any) {
  if (tableInitialized) return;
  try {
    await sql`
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
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches (created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_room_code ON matches (room_code);`;
    tableInitialized = true;
  } catch (err) {
    console.warn('Could not auto-create matches table:', err);
  }
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    res.status(503).json({
      success: false,
      error: 'DATABASE_URL environment variable is not configured. Please add it to your Vercel project settings.',
    });
    return;
  }

  const sql = neon(databaseUrl);

  // Auto-create schema on first run
  await ensureMatchesTable(sql);

  if (req.method === 'GET') {
    try {
      const roomCode = req.query?.room_code ? String(req.query.room_code).trim().toUpperCase() : null;
      const limit = Math.min(parseInt(req.query?.limit || '50', 10), 100);

      let rows;
      if (roomCode) {
        rows = await sql`
          SELECT * FROM matches 
          WHERE UPPER(room_code) = ${roomCode} 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
      } else {
        rows = await sql`
          SELECT * FROM matches 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
      }

      // Convert rows to MatchRecord structure
      const matches = (rows || []).map((r: any) => ({
        id: r.id,
        map: r.map,
        mapImage: r.map_image,
        result: r.result,
        scoreTeam: r.score_team,
        scoreEnemy: r.score_enemy,
        matchMvpName: r.match_mvp,
        notes: r.notes,
        timestamp: new Date(r.created_at).getTime(),
        players: typeof r.players === 'string' ? JSON.parse(r.players) : r.players,
      }));

      res.status(200).json({
        success: true,
        matches,
        count: matches.length,
      });
    } catch (err: any) {
      console.error('Error querying Neon matches:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to query matches from Neon database',
      });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const match = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!match || !match.map || !match.result) {
        res.status(400).json({
          success: false,
          error: 'Missing required match fields (map, result)',
        });
        return;
      }

      const id = match.id || `match_${Date.now()}`;
      const roomCode = match.roomCode ? String(match.roomCode).trim().toUpperCase() : null;
      const map = String(match.map);
      const result = String(match.result);
      const scoreTeam = Number(match.scoreTeam) || 0;
      const scoreEnemy = Number(match.scoreEnemy) || 0;
      const matchMvp = match.matchMvpName || null;
      const notes = match.notes || null;
      const playersJson = JSON.stringify(match.players || []);
      const createdAt = new Date(match.timestamp || Date.now()).toISOString();

      await sql`
        INSERT INTO matches (
          id, room_code, map, result, score_team, score_enemy, match_mvp, notes, players, created_at
        ) VALUES (
          ${id}, ${roomCode}, ${map}, ${result}, ${scoreTeam}, ${scoreEnemy}, ${matchMvp}, ${notes}, ${playersJson}::jsonb, ${createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          room_code = EXCLUDED.room_code,
          map = EXCLUDED.map,
          result = EXCLUDED.result,
          score_team = EXCLUDED.score_team,
          score_enemy = EXCLUDED.score_enemy,
          match_mvp = EXCLUDED.match_mvp,
          notes = EXCLUDED.notes,
          players = EXCLUDED.players;
      `;

      res.status(201).json({
        success: true,
        id,
        message: 'Match saved to Neon PostgreSQL successfully',
      });
    } catch (err: any) {
      console.error('Error inserting into Neon matches:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to save match to Neon database',
      });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
