import { useState, useEffect } from 'react'

function SubmitPage() {
    const [youtubeURL, setYoutubeURL] = useState("");
    const [proposedStars, setProposedStars] = useState("");
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    async function handleSubmit() {
  if (!youtubeURL || proposedStars === "") {
    setMessage({ text: "Please fill in both fields.", ok: false });
    return;
  }

  setSending(true);
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeUrl: youtubeURL,
        suggestedStars: Number(proposedStars)
      })
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ text: "Thanks! Your clip was submitted for review.", ok: true });
      setYoutubeURL("");
      setProposedStars("");
    } else {
      setMessage({ text: data.error, ok: false });
    }
  } catch (err) {
    setMessage({ text: "Could not reach the server.", ok: false });
  } finally {
    setSending(false);
  }
}

  return (
    <div>
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

export default SubmitPage