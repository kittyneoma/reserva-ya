import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState('upcoming')

  const load = () => {
    setLoading(true)
    const params = filter === 'upcoming' ? '?upcoming=true' : filter === 'past' ? '?past=true' : ''
    axios.get(`/api/reservations/my/reservations${params}`)
      .then(res => setReservations(res.data.reservations || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleCancel = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return
    setCancelling(id)
    try {
      await axios.put(`/api/reservations/${id}/cancel`)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la reserva')
    } finally {
      setCancelling(null)
    }
  }

  const badgeClass = status => ({
    pending:   'badge badge-pending',
    confirmed: 'badge badge-confirmed',
    cancelled: 'badge badge-cancelled',
    completed: 'badge badge-completed',
  }[status] || 'badge badge-pending')

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container section-sm">

        <h1 className="page-title">Mis Reservaciones</h1>

        {/* filtros */}
        <div className="filter-bar">
          {[['upcoming','Próximas'], ['past','Pasadas'], ['all','Todas']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`filter-btn ${filter === val ? 'filter-btn-active' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="loading-text">Cargando reservaciones...</p>}

        {!loading && reservations.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">📅</p>
            <p>No tienes reservaciones {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}.</p>
          </div>
        )}

        <div className="list-stack">
          {reservations.map(r => (
            <div key={r.id} className="card card-padded">
              <div className="card-row">
                <div>
                  <h3 className="card-title">{r.restaurant_name}</h3>
                  <p className="card-meta">{r.restaurant_address}</p>
                  <div className="info-row">
                    <span>📅 {new Date(r.reservation_date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>🕐 {r.reservation_time?.slice(0,5)}</span>
                    <span>👥 {r.party_size} personas</span>
                    {r.table_number && <span>🪑 Mesa {r.table_number}</span>}
                  </div>
                  {r.special_requests && <p className="card-note">"{r.special_requests}"</p>}
                </div>
                <span className={badgeClass(r.status)}>{STATUS_LABELS[r.status]}</span>
              </div>
              {r.status === 'pending' && (
                <button onClick={() => handleCancel(r.id)} disabled={cancelling === r.id}
                  className="btn-danger-ghost">
                  {cancelling === r.id ? 'Cancelando...' : 'Cancelar reserva'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer className="footer">© 2026 ReservaYa</footer>
    </div>
  )
}