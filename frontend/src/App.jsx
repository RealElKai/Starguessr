import { Routes, Route } from 'react-router-dom'
import Header from './components/header'
import GamePage from './pages/gamePage'
import SubmitPage from './pages/submitPage'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/submit" element={<SubmitPage />} />
      </Routes>
    </>
  )
}