const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** 
 * genera un JWT para el usuario dado
 */
const generateToken = (user) =>
    jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * POST /api/auth/register - registra un nuevo usuario
 */
const register = async (req, res) => {
    try {
        console.log('Body recibido:', req.body)
        const { email, password, firstName, lastName, phone, role } = req.body;

        if (!email || !password || !firstName || !lastName)
            return res.status(400).json({ error: 'Email, contraseña, nombre y apellido son requeridos' });

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: 'Formato de email inválido'});

        if (password.length < 8)
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres'});

        if (await User.findByEmail(email))
            return res.status(400).json({ error: 'Este email ya está registrado' });

        const user = await User.create({ email, password, firstName, lastName, phone, role });
        const token = generateToken(user);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role }
        });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error al registrar usuario '});
    }
};

/**
 * POST /api/auth/login - inicia sesion y retorna token JWT
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        
        const user = await User.findByEmail(email);
        if (!user || !(await User.verifyPassword(password, user.password_hash)))
            return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = generateToken(user);
        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role }
        });
    } catch (err) {
        console.error('Error en inicio de sesión', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

/**
 * GET /api/auth/profile - retorna el perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, phone: user.phone, role: user.role }});
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener perfil '});
    }
};

module.exports = { register, login, getProfile };