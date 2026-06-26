import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* hero */}
      <section className="hero">
        <div className="img-hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-eyebrow">Sistema de Reservaciones</p>
            <h1 className="hero-title">
              Tu mesa,<br />
              <span>tu momento.</span>
            </h1>
            <p className="hero-subtitle">
              Descubre los mejores sabores de México y reserva tu lugar en segundos.<br />
              Sin esperas, sin llamadas.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-lg" onClick={() => navigate('/restaurants')}>
                Explorar restaurantes
              </button>
              <button className="btn-secondary btn-lg" onClick={() => navigate('/register')}>
                Crear cuenta gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">¿Por qué <span>MesaYa</span>?</h2>
          <p className="section-subtitle">Todo lo que necesitas para reservar o gestionar tu restaurante</p>
          <div className="features-grid">
            {[
              { icon: '📅', title: 'Reserva en línea',        desc: 'Elige fecha, hora y número de comensales sin llamadas ni esperas.' },
              { icon: '🍜', title: 'Explora el menú',         desc: 'Consulta platillos y precios antes de llegar para ir preparado.' },
              { icon: '✅', title: 'Confirmación al instante', desc: 'Recibe confirmación inmediata y gestiona tus reservas fácilmente.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta dueños */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">¿Eres dueño de un restaurante?</h2>
          <p className="cta-subtitle">
            Registra tu negocio, gestiona tus mesas y recibe reservaciones en tiempo real.
          </p>
          <button className="btn-accent btn-lg" onClick={() => navigate('/register')}>
            Registrar mi restaurante
          </button>
        </div>
      </section>

      <footer className="footer">© 2026 ReservaYa — Sistema de Reservas para Restaurantes</footer>
    </div>
  )
}