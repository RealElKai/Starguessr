const express = require('express');
const cors = require('cors');
const pool = require('./db');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Zufälliger Clip, aber OHNE correct_stars
app.get('/api/clip', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, video_url FROM clips ORDER BY random() LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Keine Clips vorhanden' });
    }

    const clip = result.rows[0];
    res.json({ id: clip.id, videoUrl: clip.video_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Guess prüfen, Punkte serverseitig berechnen
app.post('/api/guess', async (req, res) => {
  const { clipId, guess } = req.body;

  if (!Number.isInteger(clipId) || !Number.isInteger(guess) || guess < 0 || guess > 100000) {
    return res.status(400).json({ error: 'Ungültige Eingabe' });
  }

  try {
    const result = await pool.query(
      'SELECT correct_stars FROM clips WHERE id = $1',
      [clipId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clip nicht gefunden' });
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
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Max. 5 Einsendungen pro Stunde und IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Einsendungen, bitte später erneut versuchen' }
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
    return res.status(400).json({ error: 'Ungültiger YouTube-Link' });
  }

  if (!Number.isInteger(suggestedStars) || suggestedStars < 0 || suggestedStars > 100000) {
    return res.status(400).json({ error: 'Ungültige Sterne-Anzahl' });
  }

  try {
    await pool.query(
      'INSERT INTO submissions (youtube_id, suggested_stars) VALUES ($1, $2)',
      [youtubeId, suggestedStars]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

function calculatePoints(diff) {
  const maxPoints = 100;
  const penaltyPerStar = 1;
  return Math.max(maxPoints - diff * penaltyPerStar, 0);
}

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});