const express = require('express');
const pool = require('./db');
const rateLimit = require('express-rate-limit');

const argon2 = require('argon2');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');


const app = express();
const PORT = 3001;

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const SESSION_DAYS = 7;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function getSessionUser(req) {
  const token = req.cookies.session;
  if (typeof token !== 'string') return null;

  const result = await pool.query(
    `SELECT u.id, u.username, u.role FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );
  return result.rows[0] || null;
}

const dummyHashPromise = argon2.hash('not-a-real-password');

// Strenger als bei der Registrierung: 10 Versuche pro 15 Minuten und IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE lower(username) = lower($1)',
      [username]
    );
    const user = result.rows[0];

    // Auch bei unbekanntem Namen wird ein Hash geprüft, damit die Antwortzeit gleich bleibt
    const hashToCheck = user ? user.password_hash : await dummyHashPromise;
    const valid = await argon2.verify(hashToCheck, password);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = crypto.randomBytes(32).toString('base64url');
    await pool.query(
      `INSERT INTO sessions (token_hash, user_id, expires_at)
       VALUES ($1, $2, now() + make_interval(days => $3))`,
      [hashToken(token), user.id, SESSION_DAYS]
    );

    res.cookie('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
    });
    res.json({ ok: true, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Wer bin ich? Das Frontend fragt das beim Laden der Seite
app.get('/api/me', async (req, res) => {
  try {
    const user = await getSessionUser(req);
    res.json({ user: user ? { username: user.username, role: user.role } : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  const token = req.cookies.session;
  try {
    if (typeof token === 'string') {
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
    }
    res.clearCookie('session');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Abgelaufene Sessions stündlich löschen
setInterval(() => {
  pool.query('DELETE FROM sessions WHERE expires_at < now()').catch(console.error);
}, 60 * 60 * 1000);

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' }
});

app.post('/api/register', registerLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters: letters, numbers, underscore' });
  }
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be 10-128 characters' });
  }

  try {
    const hash = await argon2.hash(password);
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, hash]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Zufälliger Clip, aber OHNE correct_stars
app.get('/api/clip', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, youtube_id FROM clips ORDER BY random() LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No clips available' });
    }

    const clip = result.rows[0];
    res.json({ id: clip.id, youtubeId: clip.youtube_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Guess prüfen, Punkte serverseitig berechnen
app.post('/api/guess', async (req, res) => {
  const { clipId, guess } = req.body;

  if (!Number.isInteger(clipId) || !Number.isInteger(guess) || guess < 0 || guess > 100000) {
    return res.status(400).json({ error: 'Invalid Input' });
  }

  try {
    const result = await pool.query(
      'SELECT correct_stars FROM clips WHERE id = $1',
      [clipId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    const correctStars = result.rows[0].correct_stars;
    const diff = Math.abs(guess - correctStars);
    const points = calculatePoints(diff);

    res.json({
      correct: diff === 0,
      correctStars,
      diff,
      points
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Max. 5 Einsendungen pro Stunde und IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Wow, that`s a lot of submits. Please try again later' }
});

function extractYoutubeId(input) {
  if (typeof input !== 'string' || input.length > 200) return null;

  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null;

  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id = null;

  if (host === 'youtu.be') {
    id = url.pathname.slice(1);
  } else if (host === 'youtube.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')) {
      id = url.pathname.split('/')[2];
    }
  }

  return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
}

app.post('/api/submit', submitLimiter, async (req, res) => {
  const { youtubeUrl, suggestedStars } = req.body;

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) {
    return res.status(400).json({ error: 'Invalid YouTube link' });
  }

  if (!Number.isInteger(suggestedStars) || suggestedStars < 0 || suggestedStars > 100000) {
    return res.status(400).json({ error: 'Invalid Star count' });
  }

  try {
  const user = await getSessionUser(req);

  await pool.query(
    'INSERT INTO submissions (youtube_id, suggested_stars, user_id) VALUES ($1, $2, $3)',
    [youtubeId, suggestedStars, user ? user.id : null]
  );
  res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function calculatePoints(diff) {
  const maxPoints = 100;
  const penaltyPerStar = 0.5;
  return Math.max(maxPoints - diff * penaltyPerStar, 0);
}

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});