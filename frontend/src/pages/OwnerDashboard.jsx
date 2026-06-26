import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = { monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles', thursday:'Jueves', friday:'Viernes', saturday:'Sábado', sunday:'Domingo' }

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [tables, setTables] = useState([])
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
    axios.get(`/api/tables/restaurant/${selected.id}`)
      .then(res => setTables(res.data.tables || []))
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

  const toggleRestaurantStatus =async () => {
    try {
        const { data } = await axios.patch(
            `/api/restaurants/${selected.id}/status`,
            {
                isActive: !selected.is_active
            }
        );

        setSelected(data.restaurant);

        setRestaurants(prev =>
            prev.map(r =>
                r.id === selected.id
                    ? data.restaurant
                    : r
            )
        );
    } catch (err) {
        alert(
            err.response?.data?.error ||
            "Error al actualizar restaurante"
        );
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

        <div className="page-header">
          <h1 className="page-title">Panel del Dueño</h1>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            {showCreateForm ? 'Cancelar' : '+ Agregar Restaurante'}
          </button>
        </div>

        {selected && (
            <div className="card card-padded restaurant-status-card">
                <div className="restaurant-status-info">
                    <h3>{selected.name}</h3>

                    <p>
                        Estado:
                        {' '}
                        <span
                            className={
                                selected.is_active
                                    ? "status-active"
                                    : "status-inactive"
                            }
                        >

                            {selected.is_active
                                ? "Activo"
                                : "Inactivo"}
                        </span>
                    </p>

                </div>

                <label className="switch">
                    <input
                        type="checkbox"
                        checked={selected.is_active}
                        onChange={toggleRestaurantStatus}
                    />
                    <span className="switch-slider"></span>
                </label>
            </div>
        )}

        {createMsg && (
          <div className={`alert alert-${createMsg.type === 'success' ? 'success' : 'error'}`}>
            {createMsg.text}
          </div>
        )}

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
                  {[
                    ['reservations','Reservaciones'],
                    ['menu','Menú'],
                    ['tables','Mesas'],
                    ['hours','Horarios'],
                  ].map(([val, label]) => (
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
                                {r.table_number && <span> Mesa {r.table_number}</span>}
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
                  <>
                    <AddMenuItem restaurantId={selected.id} onAdded={item => setMenuItems(prev => [...prev, item])} />
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
                  </>
                )}

                {tab === 'tables' && (
                  <ManageTables
                    restaurantId={selected.id}
                    tables={tables}
                    onAdded={t => setTables(prev => [...prev, t])}
                    onRemoved={id => setTables(prev => prev.filter(t => t.id !== id))}
                  />
                )}

                {tab === 'hours' && (
                  <ManageHours restaurant={selected} onUpdated={updated => setSelected(updated)} />
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

function AddMenuItem({ restaurantId, onAdded }) {
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const { data } = await axios.post('/api/menu', {
        restaurantId, name: form.name, description: form.description,
        category: form.category, price: parseFloat(form.price)
      })
      onAdded(data.MenuItem)
      setForm({ name: '', description: '', category: '', price: '' })
      setMsg({ type: 'success', text: 'Platillo agregado' })
      setOpen(false)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al agregar platillo' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-padded card-mb">
      <div className="card-row-between">
        <h3 className="card-section-title" style={{ marginBottom: 0 }}>Platillos</h3>
        <button onClick={() => setOpen(!open)} className="btn-primary btn-sm">
          {open ? 'Cancelar' : '+ Agregar platillo'}
        </button>
      </div>
      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginTop: 16 }}>{msg.text}</div>}
      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="Ej. Tacos de Canasta" required />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-field" placeholder="Ej. Platillo Fuerte, Bebida, Postre" required />
            </div>
            <div className="form-group form-col-full">
              <label className="form-label">Descripción</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field" placeholder="Descripción del platillo" />
            </div>
            <div className="form-group">
              <label className="form-label">Precio *</label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="input-field" placeholder="0.00" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-sm">
            {loading ? 'Guardando...' : 'Guardar platillo'}
          </button>
        </form>
      )}
    </div>
  )
}

function ManageTables({ restaurantId, tables, onAdded, onRemoved }) {
  const [form, setForm] = useState({ tableNumber: '', capacity: 2 })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const { data } = await axios.post('/api/tables', {
        restaurantId, tableNumber: form.tableNumber, capacity: parseInt(form.capacity)
      })
      onAdded(data.table)
      setForm({ tableNumber: '', capacity: 2 })
      setMsg({ type: 'success', text: 'Mesa agregada' })
      setOpen(false)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al agregar mesa' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    try {
      await axios.delete(`/api/tables/${id}`)
      onRemoved(id)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar mesa')
    }
  }

  return (
    <div>
      <div className="card card-padded card-mb">
        <div className="card-row-between">
          <h3 className="card-section-title" style={{ marginBottom: 0 }}>Disposición de Mesas</h3>
          <button onClick={() => setOpen(!open)} className="btn-primary btn-sm">
            {open ? 'Cancelar' : '+ Agregar mesa'}
          </button>
        </div>
        {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginTop: 16 }}>{msg.text}</div>}
        {open && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Número / Nombre de mesa *</label>
                <input value={form.tableNumber} onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                  className="input-field" placeholder="Ej. M1, Terraza-1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Capacidad *</label>
                <select value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="input-field">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-sm">
              {loading ? 'Guardando...' : 'Guardar mesa'}
            </button>
          </form>
        )}
      </div>

      <div className="menu-grid">
        {tables.length === 0 && <p className="empty-text">No hay mesas registradas.</p>}
        {tables.map(t => (
          <div key={t.id} className="card card-padded card-row-between">
            <div>
              <h4 className="menu-item-name"> Mesa {t.table_number}</h4>
              <p className="card-meta">{t.capacity} personas · {t.is_active ? 'Activa' : 'Inactiva'}</p>
            </div>
            <button onClick={() => handleRemove(t.id)} className="btn-danger-ghost btn-sm">Eliminar</button>
          </div>
        ))}
      </div>
        <AvailabilityChecker restaurantId={restaurantId} />
    </div>
  )
}

function ManageHours({ restaurant, onUpdated }) {
  const defaultHours = DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: { open: '08:00', close: '22:00', closed: false }
  }), {})

  const [hours, setHours] = useState(() => ({
    ...defaultHours,
    ...(restaurant.operating_hours || {})
  }))
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleSave = async () => {
    setLoading(true)
    setMsg(null)
    try {
      const { data } = await axios.put(`/api/restaurants/${restaurant.id}`, {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        cuisineType: restaurant.cuisine_type,
        priceRange: restaurant.price_range,
        phone: restaurant.phone,
        email: restaurant.email,
        operatingHours: hours
      })
      onUpdated(data.restaurant)
      setMsg({ type: 'success', text: 'Horarios guardados correctamente' })
      setEditing(false)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al guardar horarios' })
    } finally {
      setLoading(false)
    }
  }

  const setDay = (day, field, value) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  return (
    <div className="card card-padded">
      <div className="card-row-between" style={{ marginBottom: 16 }}>
        <h3 className="card-section-title" style={{ marginBottom: 0 }}>Horarios de Operación</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary btn-sm">
            Editar horarios
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {/* vista lectura */}
      {!editing && (
        <div className="list-stack">
          {DAYS.map(day => (
            <div key={day} className="card card-padded card-row-between">
              <p style={{ fontWeight: 700, color: 'var(--text-heading)', minWidth: 100 }}>{DAY_LABELS[day]}</p>
              {hours[day]?.closed
                ? <span className="badge badge-cancelled">Cerrado</span>
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {hours[day]?.open || '08:00'} — {hours[day]?.close || '22:00'}
                  </span>
              }
            </div>
          ))}
        </div>
      )}

      {/* vista edicion */}
      {editing && (
        <>
          <div className="list-stack">
            {DAYS.map(day => (
              <div key={day} className="card card-padded card-row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div style={{ minWidth: 100 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{DAY_LABELS[day]}</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={hours[day]?.closed || false}
                    onChange={e => setDay(day, 'closed', e.target.checked)} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Cerrado</span>
                </label>
                {!hours[day]?.closed && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <label className="form-label">Abre</label>
                      <input type="time" value={hours[day]?.open || '08:00'}
                        onChange={e => setDay(day, 'open', e.target.value)}
                        className="input-field input-auto" />
                    </div>
                    <div>
                      <label className="form-label">Cierra</label>
                      <input type="time" value={hours[day]?.close || '22:00'}
                        onChange={e => setDay(day, 'close', e.target.value)}
                        className="input-field input-auto" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="action-row">
            <button onClick={handleSave} disabled={loading} className="btn-primary btn-mt">
              {loading ? 'Guardando...' : 'Guardar horarios'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost btn-mt">
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function AvailabilityChecker({ restaurantId }) {
  const [date, setDate] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!date) return
    setLoading(true)
    try {
      const { data: tablesData } = await axios.get(`/api/tables/restaurant/${restaurantId}`)
      const allTables = tablesData.tables || []

      const { data: resData } = await axios.get(`/api/reservations/restaurant/${restaurantId}?date=${date}`)
      const reservations = resData.reservations || []

      // agrupa reservaciones por mesa
      const reservationsByTable = {}
      reservations.forEach(r => {
        if (!reservationsByTable[r.table_id]) reservationsByTable[r.table_id] = []
        reservationsByTable[r.table_id].push(r)
      })

      setResult({ allTables, reservationsByTable })
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-padded" style={{ marginTop: 24 }}>
      <h3 className="card-section-title">Disponibilidad de Mesas</h3>
      <div className="date-filter-row">
        <div>
          <label className="form-label">Fecha</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setResult(null) }}
            className="input-field input-auto" />
        </div>
        <button onClick={check} disabled={loading || !date}
          className="btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {result && (
        <div className="list-stack" style={{ marginTop: 16 }}>
          {result.allTables.length === 0 && <p className="empty-text">No hay mesas registradas.</p>}
          {result.allTables.map(t => {
            const reservas = result.reservationsByTable[t.id] || []
            return (
              <div key={t.id} className="card card-padded">
                <div className="card-row-between" style={{ marginBottom: reservas.length ? 12 : 0 }}>
                  <div>
                    <h4 className="menu-item-name"> Mesa {t.table_number}</h4>
                    <p className="card-meta">{t.capacity} personas</p>
                  </div>
                  <span className={`badge ${reservas.length === 0 ? 'badge-confirmed' : 'badge-pending'}`}>
                    {reservas.length === 0 ? 'Sin reservaciones' : `${reservas.length} reservación(es)`}
                  </span>
                </div>
                {reservas.length > 0 && (
                  <div className="list-stack" style={{ marginTop: 8 }}>
                    {reservas.map(r => (
                      <div key={r.id} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', 
                        padding: '6px 10px', background: 'var(--teal-suave)', borderRadius: 'var(--radius-sm)' }}>
                        🕐 {r.reservation_time?.slice(0,5)}
                        {r.end_time ? ` — ${r.end_time.slice(0,5)}` : ''}
                        {' · '}👥 {r.party_size} personas
                        {' · '}{r.first_name} {r.last_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}