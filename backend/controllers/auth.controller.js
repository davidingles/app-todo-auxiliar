import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { generateToken } from '../utils/jwt.js';
import { sanitizeUser } from '../utils/sanitize.js';
import {
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  createUser,
  updateUserById,
} from '../../database/models/user.model.js';
import { config } from '../config/index.js';

function frontendBaseUrl(req) {
  return `${req.protocol}://${req.hostname}:${config.port}`;
}

export async function register(req, res) {
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
}

export async function login(req, res) {
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
}

export function me(req, res) {
  res.json(sanitizeUser(req.user));
}

export function googleRedirect(req, res) {
  const clientId = config.google.clientId;
  if (!clientId || clientId.startsWith('TU_') || clientId === 'poner-aqui-tu-client-id') {
    return res.status(500).json({ error: 'Google OAuth no configurado. Revisa el archivo .env' });
  }

  const redirectUri = `${frontendBaseUrl(req)}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

export async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    const loginUrl = `${frontendBaseUrl(req)}/login.html`;
    if (!code) {
      return res.redirect(`${loginUrl}?error=google_error`);
    }

    const clientId = config.google.clientId;
    const clientSecret = config.google.clientSecret;
    const redirectUri = `${frontendBaseUrl(req)}/api/auth/google/callback`;

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
      return res.redirect(`${loginUrl}?error=google_error`);
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return res.redirect(`${loginUrl}?error=google_error`);
    }

    let user = getUserByGoogleId(googleUser.id);

    if (!user) {
      user = getUserByEmail(googleUser.email);
      if (user) {
        updateUserById(user.id, { google_id: googleUser.id, avatar: googleUser.picture || null });
        user = getUserById(user.id);
      } else {
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
    res.redirect(`${loginUrl}?token=${token}`);
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    res.redirect(`${frontendBaseUrl(req)}/login.html?error=google_error`);
  }
}