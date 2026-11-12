import { useState, useEffect } from 'react'

function SubmissionCard({ submission, onDone }) {
  const [stars, setStars] = useState(String(submission.suggested_stars));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function send(action, body) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {})
      });
      const data = await res.json();
      if (res.ok) {
        onDone(submission.id);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  function handleApprove() {
    const starsNumber = Number(stars);
    if (stars === '' || !Number.isInteger(starsNumber) || starsNumber < 0 || starsNumber > 100000) {
      setError('Please enter a valid star count.');
      return;
    }
    send('approve', { correctStars: starsNumber });
  }
  return (
    <div className="submissionCard">
      <iframe
        className="submissionVideo"
        src={`https://www.youtube.com/embed/${submission.youtube_id}`}
        title="Submitted clip"
        allow="encrypted-media; fullscreen"
      />
      <p>Submitted by {submission.username ?? 'Anonymous'}</p>
      <label>
        Stars in the clip:
        <input
          className="guessInput"
          type="number"
          value={stars}
          onChange={(e) => setStars(e.target.value)}
        />
      </label>
      <div className="submissionButtons">
        <button className="submitButton" onClick={handleApprove} disabled={busy}>Approve</button>
        <button className="logoutButton" onClick={() => send('reject')} disabled={busy}>Reject</button>
      </div>
      {error && <p className="messageError">{error}</p>}
    </div>
  )
  
}

export default function AdminClips() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/submissions');
        const data = await res.json();
        if (res.ok) {
          setSubmissions(data.submissions);
        } else {
          setError(data.error);
        }
      } catch {
        setError('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleDone(id) {
  setSubmissions(prev => prev.filter(item => item.id !== id));
}


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="messageError">{error}</p>;
  if (submissions.length === 0) return <p>No pending submissions.</p>;

  return (
    <div className="submissionList">
      {submissions.map(s => (
        <SubmissionCard key={s.id} submission={s} onDone={handleDone} />
      ))}
    </div>
  )
}