import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import {
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  createUser,
  updateUserById,
} from './db.js';

const router = Router();

// ── Helpers ──

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

// ── Middleware de autenticación ──

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ── Rutas de autenticación ──

// Registro con email y contraseña
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      email,
      name: name.trim(),
      password: hashedPassword,
      google_id: null,
      avatar: null,
      created_at: new Date().toISOString(),
    };

    createUser(user);
    const token = generateToken(user);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Inicio de sesión con email y contraseña
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener usuario actual desde el token
router.get('/me', authenticateToken, (req, res) => {
  res.json(sanitizeUser(req.user));
});

// ── Google OAuth (manual, sin passport middleware) ──

// 1) Redirige al usuario a Google
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('TU_') || clientId === 'poner-aqui-tu-client-id') {
    return res.status(500).json({ error: 'Google OAuth no configurado. Revisa el archivo .env' });
  }

  const redirectUri = `${req.protocol}://${req.hostname}:3001/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// 2) Google redirige aquí después de la autenticación
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`http://127.0.0.1:5173/login.html?error=google_error`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.hostname}:3001/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.redirect(`http://127.0.0.1:5173/login.html?error=google_error`);
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return res.redirect(`http://127.0.0.1:5173/login.html?error=google_error`);
    }

    // Find or create user
    let user = getUserByGoogleId(googleUser.id);

    if (!user) {
      user = getUserByEmail(googleUser.email);
      if (user) {
        // Link Google account to existing user
        updateUserById(user.id, { google_id: googleUser.id, avatar: googleUser.picture || null });
        user = getUserById(user.id);
      } else {
        // Create new user
        user = {
          id: randomUUID(),
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          password: null,
          google_id: googleUser.id,
          avatar: googleUser.picture || null,
          created_at: new Date().toISOString(),
        };
        createUser(user);
      }
    }

    const token = generateToken(user);
    res.redirect(`http://127.0.0.1:5173/login.html?token=${token}`);
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    res.redirect(`http://127.0.0.1:5173/login.html?error=google_error`);
  }
});

export default router;
