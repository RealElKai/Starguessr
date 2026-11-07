import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function LoginPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { refreshUser } = useAuth();

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
        await refreshUser();
        navigate("/");
    } else {
        setError(data.error);
    } 
    }

    return (
        <div className='loginContainer'>
            <form onSubmit={handleLogin} className='loginForm'>

                <p className="submitText">Login</p>

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

                <Link className="submitHint" to="/register">No account? Register one!</Link>

                {error && <p className="messageError">{error}</p>}
            </form>
        </div>
    );
}

export default LoginPage