const { useState, useEffect } = React;

function App() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [clipData, setClipData] = useState(null);

  function loadNextClip(){
    fetch("http://localhost:3001/api/clip")
    .then(res => res.json())
    .then(data => {
      setClipData(data);
      setResult(null);
      setGuess("");
    })
  }

  useEffect(() => {
    loadNextClip();
  }, []);

  function calculatePoints(diff) {
    const maxPoints = 100;
    const penaltyPerStar = 1;

    const points = maxPoints - diff * penaltyPerStar;
    return Math.max(points,0);
  }

  function handleGuess() {
    const guessNumber = Number(guess);
    const diff = Math.abs(guessNumber - clipData.correctStars);
    const points = calculatePoints(diff);

    setResult({
      correct: diff === 0,
      guessedValue: guessNumber,
      correctStars: clipData.correctStars,
      diff,
      points
    })
  }

  if(!clipData){
    return <p>Lädt...</p>
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
      <video className="video" key={clipData.videoUrl} src={clipData.videoUrl} controls></video>
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
    <div className="nextButtonDiv">
      {result && (
        <button className="nextButton" onClick={loadNextClip}>Next Clip</button>
      )}
    </div>
  </div>
);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);