import { neon } from '@neondatabase/serverless';

function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

let tableInitialized = false;
async function ensureRoomMembersTable(sql: any) {
  if (tableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS room_members (
        id TEXT PRIMARY KEY,
        room_code TEXT NOT NULL,
        player_name TEXT NOT NULL,
        is_host BOOLEAN DEFAULT FALSE,
        slot_index INTEGER,
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_room_members_code ON room_members (room_code);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_room_members_seen ON room_members (last_seen DESC);`;
    tableInitialized = true;
  } catch (err) {
    console.warn('Could not auto-create room_members table:', err);
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
      error: 'DATABASE_URL environment variable is not configured.',
    });
    return;
  }

  const sql = neon(databaseUrl);
  await ensureRoomMembersTable(sql);

  // 1. GET: Fetch active members in room
  if (req.method === 'GET') {
    try {
      const roomCode = req.query?.room_code ? String(req.query.room_code).trim().toUpperCase() : null;

      if (!roomCode) {
        res.status(400).json({ success: false, error: 'room_code query parameter is required' });
        return;
      }

      // Cleanup inactive members older than 10 minutes
      try {
        await sql`DELETE FROM room_members WHERE last_seen < NOW() - INTERVAL '10 minutes'`;
      } catch {
        // ignore
      }

      // Active members seen within last 25 seconds
      const rows = await sql`
        SELECT 
          id, 
          room_code, 
          player_name, 
          is_host, 
          slot_index, 
          EXTRACT(EPOCH FROM last_seen) * 1000 AS last_seen
        FROM room_members
        WHERE UPPER(room_code) = ${roomCode}
          AND last_seen > NOW() - INTERVAL '25 seconds'
        ORDER BY is_host DESC, created_at ASC
      `;

      const members = (rows || []).map((r: any) => ({
        id: r.id,
        playerName: r.player_name,
        isHost: Boolean(r.is_host),
        slotIndex: r.slot_index !== null ? Number(r.slot_index) : null,
        lastSeen: Number(r.last_seen),
      }));

      res.status(200).json({
        success: true,
        roomCode,
        count: members.length,
        members,
      });
    } catch (err: any) {
      console.error('Error fetching room members from Neon:', err);
      res.status(500).json({ success: false, error: err.message });
    }
    return;
  }

  // 2. POST: Register or Heartbeat member presence
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const roomCode = body?.room_code ? String(body.room_code).trim().toUpperCase() : null;
      const playerName = body?.player_name ? String(body.player_name).trim() : 'Player';
      const sessionId = body?.session_id ? String(body.session_id).trim() : null;
      const isHost = Boolean(body?.is_host);
      const slotIndex = body?.slot_index !== undefined && body?.slot_index !== null ? Number(body.slot_index) : null;

      if (!roomCode || !sessionId) {
        res.status(400).json({ success: false, error: 'room_code and session_id are required' });
        return;
      }

      const memberId = `${roomCode}_${sessionId}`;

      // Enforce single host: check if another active member is already the host of this room
      const activeHostRows = await sql`
        SELECT id FROM room_members 
        WHERE UPPER(room_code) = ${roomCode} 
          AND is_host = TRUE 
          AND id != ${memberId} 
          AND last_seen > NOW() - INTERVAL '25 seconds'
        LIMIT 1;
      `;
      const anotherHostExists = Array.isArray(activeHostRows) && activeHostRows.length > 0;
      const canBeHost = isHost && !anotherHostExists;

      await sql`
        INSERT INTO room_members (
          id, room_code, player_name, is_host, slot_index, last_seen
        ) VALUES (
          ${memberId}, ${roomCode}, ${playerName}, ${canBeHost}, ${slotIndex}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          player_name = EXCLUDED.player_name,
          is_host = CASE 
            WHEN ${anotherHostExists} THEN FALSE
            WHEN room_members.is_host = TRUE THEN TRUE 
            ELSE EXCLUDED.is_host 
          END,
          slot_index = COALESCE(EXCLUDED.slot_index, room_members.slot_index),
          last_seen = NOW();
      `;

      // Return current active members immediately to avoid extra roundtrip
      const rows = await sql`
        SELECT 
          id, 
          room_code, 
          player_name, 
          is_host, 
          slot_index, 
          EXTRACT(EPOCH FROM last_seen) * 1000 AS last_seen
        FROM room_members
        WHERE UPPER(room_code) = ${roomCode}
          AND last_seen > NOW() - INTERVAL '25 seconds'
        ORDER BY is_host DESC, created_at ASC
      `;

      const members = (rows || []).map((r: any) => ({
        id: r.id,
        playerName: r.player_name,
        isHost: Boolean(r.is_host),
        slotIndex: r.slot_index !== null ? Number(r.slot_index) : null,
        lastSeen: Number(r.last_seen),
      }));

      res.status(200).json({
        success: true,
        roomCode,
        count: members.length,
        members,
      });
    } catch (err: any) {
      console.error('Error updating room presence in Neon:', err);
      res.status(500).json({ success: false, error: err.message });
    }
    return;
  }

  // 3. DELETE: Explicitly leave room
  if (req.method === 'DELETE') {
    try {
      const body = typeof req.body === 'string' && req.body ? JSON.parse(req.body) : req.body || {};
      const roomCode = (req.query?.room_code || body.room_code || '').toString().trim().toUpperCase();
      const sessionId = (req.query?.session_id || body.session_id || '').toString().trim();

      if (roomCode && sessionId) {
        const memberId = `${roomCode}_${sessionId}`;
        await sql`DELETE FROM room_members WHERE id = ${memberId}`;
      }

      res.status(200).json({ success: true, message: 'Member removed from room' });
    } catch (err: any) {
      console.error('Error leaving room in Neon:', err);
      res.status(500).json({ success: false, error: err.message });
    }
    return;
  }

  // 4. PATCH: Transfer host privileges to another member
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' && req.body ? JSON.parse(req.body) : req.body || {};
      const roomCode = body?.room_code ? String(body.room_code).trim().toUpperCase() : null;
      const targetMemberId = body?.target_member_id ? String(body.target_member_id).trim() : null;
      const currentHostSessionId = body?.current_host_session_id ? String(body.current_host_session_id).trim() : null;

      if (!roomCode || !targetMemberId) {
        res.status(400).json({ success: false, error: 'room_code and target_member_id are required' });
        return;
      }

      // Check current host authorization if provided
      if (currentHostSessionId) {
        const currentMemberId = `${roomCode}_${currentHostSessionId}`;
        const hostCheck = await sql`
          SELECT is_host FROM room_members 
          WHERE UPPER(room_code) = ${roomCode} AND id = ${currentMemberId}
        `;
        if (!hostCheck || hostCheck.length === 0 || !hostCheck[0].is_host) {
          res.status(403).json({ success: false, error: 'Only current host can transfer host privileges' });
          return;
        }
      }

      // 1. Demote all existing hosts in this room
      await sql`UPDATE room_members SET is_host = FALSE WHERE UPPER(room_code) = ${roomCode}`;

      // 2. Promote target member
      await sql`UPDATE room_members SET is_host = TRUE, last_seen = NOW() WHERE UPPER(room_code) = ${roomCode} AND id = ${targetMemberId}`;

      // 3. Return updated active members
      const rows = await sql`
        SELECT 
          id, 
          room_code, 
          player_name, 
          is_host, 
          slot_index, 
          EXTRACT(EPOCH FROM last_seen) * 1000 AS last_seen
        FROM room_members
        WHERE UPPER(room_code) = ${roomCode}
          AND last_seen > NOW() - INTERVAL '25 seconds'
        ORDER BY is_host DESC, created_at ASC
      `;

      const members = (rows || []).map((r: any) => ({
        id: r.id,
        playerName: r.player_name,
        isHost: Boolean(r.is_host),
        slotIndex: r.slot_index !== null ? Number(r.slot_index) : null,
        lastSeen: Number(r.last_seen),
      }));

      res.status(200).json({
        success: true,
        message: 'Host privileges transferred successfully',
        roomCode,
        members,
      });
    } catch (err: any) {
      console.error('Error transferring host in Neon:', err);
      res.status(500).json({ success: false, error: err.message });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']);
  res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
