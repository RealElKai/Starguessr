const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const clips = [
  { id: 1, videoUrl: "assets/testClip.mp4", correctStars: 212 },
  { id:2, videoUrl: "assets/clip2.mp4", correctStars: 200 },
  { id:3, videoUrl: "assets/clip3.mp4", correctStars: 216 }
];

app.get('/api/clip', (req, res) => {
  const randomIndex = Math.floor(Math.random() * clips.length);
  const clip = clips[randomIndex];   // ← den tatsächlichen Clip holen

  res.json({
    id: clip.id,
    videoUrl: clip.videoUrl
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

app.post('/api/guess', (req, res) => {
  const { clipId, guess } = req.body;

  const clip = clips.find(c => c.id === clipId);
  if(!clip) {
    return res.status(404).json({error: "Clip not found"});
  }

  const diff = Math.abs(guess - clip.correctStars);
  const points = calculatePoints(diff);

  res.json({
    correct: diff === 0,
    correctStars: clip.correctStars,
    diff,
    points
  });
});

function calculatePoints(diff){
  const maxPoints = 100;
  const penaltyPerStar = 1;
  return Math.max(maxPoints - diff * penaltyPerStar, 0);
}