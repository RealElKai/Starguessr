import { useState, useEffect } from 'react'

function GamePage() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [clipData, setClipData] = useState(null);
  const [error, setError] = useState(null);

  function loadNextClip(){
    fetch("/api/clip")
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

  async function handleGuess() {
  setError(null);
  const guessNumber = Number(guess);

  if (guess === "" || !Number.isInteger(guessNumber) || guessNumber < 0 || guessNumber > 100000) {
    setError("Please enter a whole number between 0 and 100000.");
    return;
  }

  const res = await fetch("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clipId: clipData.id, guess: guessNumber })
  });
  const data = await res.json();

  if (!res.ok) {
    setError(data.error);
    return;
  }

  setResult({ ...data, guessedValue: guessNumber });
}

  if(!clipData){
    return <p>Loading...</p>
  }

  return (
  <div>
    <div className="clipContainer">
      <iframe
        key={clipData.youtubeId}
        className="video"
        src={`https://www.youtube.com/embed/${clipData.youtubeId}`}
        title="Clip"
        allow="encrypted-media; fullscreen"
      />
      <div className="clipInput">
        <input 
          className="guessInput"
          type="number"
          min="0" max="100000" step="1"
          onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
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
      {error && <p className="messageError">{error}</p>}
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

export default GamePage