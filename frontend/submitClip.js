function App() {

  return (
    <div>
        <header className="header">
            <h1>StarGuessr</h1>
            <div className="headerButtons">
                <button className="secondaryButton">Leaderboard</button>
                <button className="loginButton">Login</button>
                <button className="homeButton">Home</button>
            </div>
        </header>
        <div className="loginForm">
            <p className="submitText">Submit Clip</p>
            <input className="inputs" type="url" placeholder="YouTube Link"></input>
            <input className="inputs" type="number" placeholder="Bedwars Level in the clip"></input>
            <button className="submitButton">Submit Clip</button>
        </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);