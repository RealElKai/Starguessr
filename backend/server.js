const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

function calculatePoints(diff) {
  const maxPoints = 100;
  const penaltyPerStar = 1;
  return Math.max(maxPoints - diff * penaltyPerStar, 0);
}

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});