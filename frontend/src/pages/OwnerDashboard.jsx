import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [tab, setTab] = useState('reservations')
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [restaurantForm, setRestaurantForm] = useState({
    name:'', description:'', address:'', city:'', state:'Nuevo León',
    cuisineType:'', priceRange:2, phone:'', email:''
  })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState(null)

  useEffect(() => {
    axios.get('/api/restaurants/my/restaurants')
      .then(res => {
        const list = res.data.restaurants || []
        setRestaurants(list)
        if (list.length > 0) setSelected(list[0])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    const params = filterDate ? `?date=${filterDate}` : ''
    axios.get(`/api/reservations/restaurant/${selected.id}${params}`)
      .then(res => setReservations(res.data.reservations || []))
    axios.get(`/api/menu/restaurant/${selected.id}`)
      .then(res => setMenuItems(res.data.menuItems || []))
  }, [selected, filterDate])

  const updateStatus = async (reservationId, status) => {
    try {
      await axios.put(`/api/reservations/${reservationId}/status`, { status })
      setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar estado')
    }
  }

  const handleCreateRestaurant = async e => {
    e.preventDefault()
    setCreating(true)
    setCreateMsg(null)
    try {
      const { data } = await axios.post('/api/restaurants', restaurantForm)
      setRestaurants(prev => [...prev, data.restaurant])
      setSelected(data.restaurant)
      setShowCreateForm(false)
      setCreateMsg({ type: 'success', text: 'Restaurante creado exitosamente' })
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.response?.data?.error || 'Error al crear restaurante' })
    } finally {
      setCreating(false)
    }
  }

  const badgeClass = status => ({
    pending:   'badge badge-pending',
    confirmed: 'badge badge-confirmed',
    cancelled: 'badge badge-cancelled',
    completed: 'badge badge-completed',
  }[status] || 'badge badge-pending')

  const set = (key, val) => setRestaurantForm(prev => ({ ...prev, [key]: val }))

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <p className="loading-text">Cargando...</p>
    </div>
  )

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container section-sm">

        {/* header */}
        <div className="page-header">
          <h1 className="page-title">Panel del Dueño</h1>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            {showCreateForm ? 'Cancelar' : '+ Agregar Restaurante'}
          </button>
        </div>

        {createMsg && (
          <div className={`alert alert-${createMsg.type === 'success' ? 'success' : 'error'}`}>
            {createMsg.text}
          </div>
        )}

        {/* formulario crear restaurante */}
        {showCreateForm && (
          <div className="card card-padded card-mb">
            <h2 className="card-section-title">Nuevo Restaurante</h2>
            <form onSubmit={handleCreateRestaurant}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input value={restaurantForm.name} onChange={e => set('name', e.target.value)} className="input-field" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de cocina *</label>
                  <input value={restaurantForm.cuisineType} onChange={e => set('cuisineType', e.target.value)} className="input-field" placeholder="Mexicana, Italiana..." required />
                </div>
                <div className="form-group form-col-full">
                  <label className="form-label">Descripción</label>
                  <input value={restaurantForm.description} onChange={e => set('description', e.target.value)} className="input-field" />
                </div>
                <div className="form-group form-col-full">
                  <label className="form-label">Dirección *</label>
                  <input value={restaurantForm.address} onChange={e => set('address', e.target.value)} className="input-field" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad *</label>
                  <input value={restaurantForm.city} onChange={e => set('city', e.target.value)} className="input-field" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input value={restaurantForm.state} onChange={e => set('state', e.target.value)} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input value={restaurantForm.phone} onChange={e => set('phone', e.target.value)} className="input-field" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={restaurantForm.email} onChange={e => set('email', e.target.value)} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rango de precios</label>
                  <select value={restaurantForm.priceRange} onChange={e => set('priceRange', parseInt(e.target.value))} className="input-field">
                    <option value={1}>$ — Económico</option>
                    <option value={2}>$$ — Moderado</option>
                    <option value={3}>$$$ — Caro</option>
                    <option value={4}>$$$$ — Muy caro</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creando...' : 'Crear Restaurante'}
              </button>
            </form>
          </div>
        )}

        {restaurants.length === 0 && !showCreateForm && (
          <div className="empty-state">
            <p className="empty-icon">🏪</p>
            <p>Aún no tienes restaurantes registrados.</p>
          </div>
        )}

        {restaurants.length > 0 && (
          <>
            {restaurants.length > 1 && (
              <div className="filter-bar">
                {restaurants.map(r => (
                  <button key={r.id} onClick={() => setSelected(r)}
                    className={`filter-btn ${selected?.id === r.id ? 'filter-btn-active' : ''}`}>
                    {r.name}
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <>
                {/* stats */}
                <div className="stats-grid">
                  {[
                    { label: 'Total',      value: reservations.length,                                    icon: '📋' },
                    { label: 'Pendientes', value: reservations.filter(r => r.status==='pending').length,   icon: '⏳' },
                    { label: 'Confirmadas',value: reservations.filter(r => r.status==='confirmed').length, icon: '✅' },
                    { label: 'Canceladas', value: reservations.filter(r => r.status==='cancelled').length, icon: '❌' },
                  ].map(s => (
                    <div key={s.label} className="card stat-card">
                      <span className="stat-icon">{s.icon}</span>
                      <p className="stat-value">{s.value}</p>
                      <p className="stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* tabs */}
                <div className="filter-bar">
                  {[['reservations','Reservaciones'], ['menu','Menú']].map(([val, label]) => (
                    <button key={val} onClick={() => setTab(val)}
                      className={`filter-btn ${tab === val ? 'filter-btn-active' : ''}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {tab === 'reservations' && (
                  <>
                    <div className="date-filter-row">
                      <label className="form-label">Filtrar por fecha:</label>
                      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="input-field input-auto" />
                      {filterDate && (
                        <button onClick={() => setFilterDate('')} className="btn-ghost btn-sm">Limpiar</button>
                      )}
                    </div>
                    <div className="list-stack">
                      {reservations.length === 0 && <p className="empty-text">No hay reservaciones.</p>}
                      {reservations.map(r => (
                        <div key={r.id} className="card card-padded">
                          <div className="card-row">
                            <div>
                              <p className="card-title">{r.first_name} {r.last_name}</p>
                              <p className="card-meta">{r.email} · {r.phone}</p>
                              <div className="info-row">
                                <span>📅 {new Date(r.reservation_date).toLocaleDateString('es-MX')}</span>
                                <span>🕐 {r.reservation_time?.slice(0,5)}</span>
                                <span>👥 {r.party_size} personas</span>
                                {r.table_number && <span>🪑 Mesa {r.table_number}</span>}
                              </div>
                              {r.special_requests && <p className="card-note">"{r.special_requests}"</p>}
                            </div>
                            <span className={badgeClass(r.status)}>{STATUS_LABELS[r.status]}</span>
                          </div>
                          {r.status === 'pending' && (
                            <div className="action-row">
                              <button onClick={() => updateStatus(r.id, 'confirmed')} className="btn-success-ghost">Confirmar</button>
                              <button onClick={() => updateStatus(r.id, 'cancelled')} className="btn-danger-ghost">Rechazar</button>
                            </div>
                          )}
                          {r.status === 'confirmed' && (
                            <button onClick={() => updateStatus(r.id, 'completed')} className="btn-info-ghost">Marcar completada</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {tab === 'menu' && (
                  <div className="menu-grid">
                    {menuItems.length === 0 && <p className="empty-text">No hay platillos en el menú.</p>}
                    {menuItems.map(item => (
                      <div key={item.id} className="card card-padded card-row-between">
                        <div>
                          <h4 className="menu-item-name">{item.name}</h4>
                          <p className="menu-item-desc">{item.description}</p>
                          <span className="category-tag">{item.category}</span>
                        </div>
                        <span className="price-tag">${Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <footer className="footer">© 2026 ReservaYa</footer>
    </div>
  )
}