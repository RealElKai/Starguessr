import { useState, useEffect } from 'react'

function GamePage() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [clipData, setClipData] = useState(null);

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

  function handleGuess() {
    fetch("/api/guess", {
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
    <div className="clipContainer">
      <iframe
        key={clipData.youtubeId}
        className="video"
        src={`https://www.youtube.com/embed/${clipData.youtubeId}`}
        title="Clip"
        allow="encrypted-media; fullscreen"
        allowFullScreen
      />
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

export default GamePage