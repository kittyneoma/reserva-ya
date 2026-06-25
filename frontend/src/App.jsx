import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantList from './pages/RestaurantList'
import RestaurantDetail from './pages/RestaurantDetail'
import MyReservations from './pages/MyReservations'
import OwnerDashboard from './pages/OwnerDashboard'

// ruta protegida - redirige al login si no hay sesion
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-terracota-500 text-xl">Cargando...</div>
  return user ? children : <Navigate to="/login" />
}

// ruta solo para dueños de restaurante
const OwnerRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-terracota-500 text-xl">Cargando...</div>
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'restaurant_owner') return <Navigate to="/" />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/"                  element={<Home />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register"          element={<Register />} />
      <Route path="/restaurants"       element={<RestaurantList />} />
      <Route path="/restaurants/:id"   element={<RestaurantDetail />} />
      <Route path="/my-reservations"   element={<PrivateRoute><MyReservations /></PrivateRoute>} />
      <Route path="/owner/dashboard"   element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="*"                  element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App