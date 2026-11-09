import Header from './components/header'
import GamePage from './pages/gamePage'
import SubmitPage from './pages/submitPage'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import AdminLayout from './components/adminLayout'
import AdminOverview from './pages/adminOverview'
import AdminClips from './pages/adminClips'
import { Routes, Route, Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<GamePage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="clips" element={<AdminClips />} />
      </Route>
    </Routes>
  )
}