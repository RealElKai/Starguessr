const { useState, useEffect } = React;

function App() {
    const [youtubeURL, setYoutubeURL] = useState("");
    const [proposedStars, setProposedStars] = useState("");
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    async function handleSubmit() {
  // 1. Leere Felder abfangen (Number("") wäre sonst 0)
  if (!youtubeURL || proposedStars === "") {
    setMessage({ text: "Please fill in both fields.", ok: false });
    return;
  }

  setSending(true);
  try {
    // 2. Request abschicken und auf die Antwort warten
    const res = await fetch("http://localhost:3001/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeUrl: youtubeURL,
        suggestedStars: Number(proposedStars)
      })
    });
    const data = await res.json();

    // 3. Antwort auswerten
    if (res.ok) {
      setMessage({ text: "Thanks! Your clip was submitted for review.", ok: true });
      setYoutubeURL("");
      setProposedStars("");
    } else {
      setMessage({ text: data.error, ok: false });
    }
  } catch (err) {
    // 4. Server nicht erreichbar
    setMessage({ text: "Could not reach the server.", ok: false });
  } finally {
    // 5. Button wieder freigeben, egal was passiert ist
    setSending(false);
  }
}

  return (
    <div>
        <header className="header">
            <h1>StarGuessr</h1>
            <div className="headerButtons">
                <a href="index.html" className="secondaryButton">Home</a>
                <button className="secondaryButton">Leaderboard</button>
                <button className="loginButton">Login</button>
            </div>
        </header>
        <div className="loginForm">
            <p className="submitText">Submit Clip</p>
            <p className="submitHint">Found a great clip? Submit it here! Every submission is reviewed by our team before it appears in the game.</p>
            <input
                className="inputs"
                type="url"
                placeholder="YouTube Link"
                value={youtubeURL}
                onChange={(e) => setYoutubeURL(e.target.value)}
            />
            <input
                className="inputs"
                type="number"
                placeholder="Bedwars Level in the clip"
                value={proposedStars}
                onChange={(e) => setProposedStars(e.target.value)}
            />
            <button onClick={handleSubmit} className="submitButton" disabled={sending}>Submit Clip</button>
            {message && (
                <p className={message.ok ? "messageOk" : "messageError"}>{message.text}</p>
            )}
        </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);