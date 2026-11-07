import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function RegisterPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    async function handleLogin(e) {
    e.preventDefault();

    if (repeatedPassword !== password){
        setError("Passwords do not match");
        return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      })
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.error);
        return;
    } 

    const loginRes = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      })
    });

    if (loginRes.ok){
        await refreshUser();
        navigate("/");
    } else {
        navigate("/login");
    }


    }

    return (
        <div className='registerLayout'>

                <form onSubmit={handleLogin} className='loginForm'>

                    <p className="submitText">Register</p>

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

                    <input 
                        className='guessInput'
                        type="password" value={repeatedPassword}
                        onChange={(e) => setRepeatedPassword(e.target.value)}
                        placeholder="Password again"
                    />

                    <button type="submit" className='loginButton'>Register</button>

                    <Link className="submitHint" to="/login">Already have an account? Login!</Link>

                    {error && <p className="messageError">{error}</p>}
                </form>

            <div className='rulesContainer'>
                <p className='submitHint'>Rules:</p>
                <ul className="rules">
                    <li className='submitHint'>Username: 3-20 characters (letters, numbers, underscore)</li>
                    <li className='submitHint'>Password: at least 10 characters</li>
                </ul>
            </div>
        </div>
    );
}

export default RegisterPage