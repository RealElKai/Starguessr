import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Header() { 
    const { user, loading, logout } = useAuth();

    return (

    <header className="header">
        <Link to="/" className="logo"><h1>StarGuessr</h1></Link>
        <div className="headerButtons">
            <button className="secondaryButton">Leaderboard</button>
            {!loading && (
                user ? (
                    <>
                    <span className="userPill">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                        </svg>
                        {user.username}
                    </span>
                    <button className="logoutButton" onClick={logout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="loginButton">Login</Link>
                )
            )}
            <Link to="/submit" className="submitButton">Submit Clip</Link>
        </div>
    </header>
)}