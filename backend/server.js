const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

const clips = [
  { videoUrl: "assets/testClip.mp4", correctStars: 212 },
  { videoUrl: "assets/clip2.mp4", correctStars: 200 },
  { videoUrl: "assets/clip3.mp4", correctStars: 216 }
];

app.get('/api/clip', (req, res) => {
  const randomIndex = Math.floor(Math.random() * clips.length);
  res.json(clips[randomIndex]);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});