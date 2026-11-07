import { Routes, Route } from 'react-router-dom'
import Header from './components/header'
import GamePage from './pages/gamePage'
import SubmitPage from './pages/submitPage'
import LoginPage from './pages/loginPage'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </>
  )
}