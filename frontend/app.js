const { useState } = React;

function App() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);

  const correctStars = 218;

  function calculatePoints(diff) {
    const maxPoints = 100;
    const penaltyPerStar = 1;

    const points = maxPoints - diff * penaltyPerStar;
    return Math.max(points,0);
  }

  function handleGuess() {
    const guessNumber = Number(guess);
    const diff = Math.abs(guessNumber - correctStars);
    const points = calculatePoints(diff);

    setResult({
      correct: diff === 0,
      guessedValue: guessNumber,
      correctStars,
      diff,
      points
    })
  }

  return (
  <div>
    <header className="header">
        <h1>StarGuessr</h1>
        <div className="headerButtons">
            <button className="secondaryButton">Leaderboard</button>
            <button className="loginButton">Login</button>
            <button className="submitButton">Submit Clip</button>
        </div>
    </header>
    <div className="clipContainer">
      <video className="video" src="assets/testClip.mp4" controls></video>
      <div className="clipInput">
        <input 
          className="guessInput"
          type="number"
          placeholder="How many stars?"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button className="guessButton" onClick={handleGuess}>Guess</button>
      </div>
    </div>


    <div className="resultBox">

      <div className="results">
        <p className="resultText">Your Guess:</p>
        <p className="yourGuess">{result ? result.guessedValue : "???"}</p>
      </div>

      <div className="results">
        <p className="resultText">Correct Stars:</p>
        <p className="correctStars">{result ? result.correctStars : "???"}</p>
      </div>

      <div className="results">
        <p className="resultText">Points:</p>
        <p className="yourGuess">{result ? `+${result.points}` : "???"}</p>
      </div>

    </div>
  </div>
);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);