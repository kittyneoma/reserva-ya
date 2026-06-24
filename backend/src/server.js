const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// conexion a BD
require('./config/database.js');

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// rutas
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/restaurants',  require('./routes/restaurantRoutes'));
app.use('/api/tables',       require('./routes/tableRoutes'));
app.use('/api/menu',         require('./routes/menuRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServidor corriendo en http://localhost:${PORT}\n`);
});

module.exports = app;