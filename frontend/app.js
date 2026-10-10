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

  function handleGuess() {
    fetch("http://localhost:3001/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({clipId: clipData.id, guess: Number(guess)})
    })
      .then(res => res.json())
      .then(data => setResult({ ...data, guessedValue: Number(guess)}));
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
            <a href="submitClip.html" className="submitButton">Submit Clip</a>
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
          disabled={result !== null}
        />
        <button
          className="guessButton"
          onClick={handleGuess}
          disabled={result !== null}
          >Guess</button>
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