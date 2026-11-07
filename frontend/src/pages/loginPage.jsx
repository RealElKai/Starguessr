import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);

    const navigate = useNavigate();

    async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await res.json();

    if (res.ok) {
        navigate("/");
    } else {
        setError(data.error);
    } 
    }

    return (
        <div className='loginContainer'>
            <form onSubmit={handleLogin} className='loginForm'>
                <input 
                className='guessInput'
                type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                />

                <input 
                className='guessInput'
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                />

                <button type="submit" className='loginButton'>Login</button>

                {error && <p className="messageError">{error}</p>}
            </form>
        </div>
    );
}

export default LoginPage