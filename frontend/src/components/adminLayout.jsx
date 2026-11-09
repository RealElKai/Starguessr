import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="adminLayout">
      <header className="adminHeader">
        <h1>StarGuessr <span className='secondaryHeaderText'>Admin</span></h1>
      </header>
      <nav className="adminSidebar">
        <NavLink className="adminSidebarButtons" to="/admin" end>Overview</NavLink>
        <NavLink className="adminSidebarButtons" to="/admin/clips">Clips</NavLink>
      </nav>
      <main className="adminContent">
        <Outlet />
      </main>
    </div>
  )
}