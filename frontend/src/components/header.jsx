import { Link } from 'react-router-dom'

export default function Header() { return (
    <header className="header">
        <Link to="/" className="logo"><h1>StarGuessr</h1></Link>
        <div className="headerButtons">
            <button className="secondaryButton">Leaderboard</button>
            <Link to="/login" className="loginButton">Login</Link>
            <Link to="/submit" className="submitButton">Submit Clip</Link>
        </div>
    </header>
) }