import { saveToken, saveUser, getToken } from './auth/session.js';

const API_AUTH = '/api/auth';

// ── Elementos del DOM ──

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const googleBtn = document.getElementById('google-btn');

// ── Estado ──

let currentTab = 'login'; // 'login' | 'register'

// ── Utilidades ──

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function hideError(element) {
  element.classList.add('hidden');
  element.textContent = '';
}

// ── Verificar sesión activa ──

async function checkExistingSession() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_AUTH}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      window.location.href = '/';
    }
  } catch {
    // Token inválido, continuar en login
  }
}

// ── Cambio de pestañas ──

function setTab(tab) {
  currentTab = tab;
  tabLogin.classList.toggle('active', tab === 'login');
  tabRegister.classList.toggle('active', tab === 'register');
  loginForm.classList.toggle('hidden', tab !== 'login');
  registerForm.classList.toggle('hidden', tab !== 'register');
  hideError(loginError);
  hideError(registerError);
}

tabLogin.addEventListener('click', () => setTab('login'));
tabRegister.addEventListener('click', () => setTab('register'));

// ── Login con email ──

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(loginError);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError(loginError, 'Completa todos los campos');
    return;
  }

  try {
    const res = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(loginError, data.error || 'Error al iniciar sesión');
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    window.location.href = '/';
  } catch (err) {
    showError(loginError, 'Error de conexión con el servidor');
  }
});

// ── Registro con email ──

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(registerError);

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  if (!name || !email || !password) {
    showError(registerError, 'Completa todos los campos');
    return;
  }

  if (password.length < 4) {
    showError(registerError, 'La contraseña debe tener al menos 4 caracteres');
    return;
  }

  try {
    const res = await fetch(`${API_AUTH}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(registerError, data.error || 'Error al registrarse');
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    window.location.href = '/';
  } catch (err) {
    showError(registerError, 'Error de conexión con el servidor');
  }
});

// ── Google OAuth ──

googleBtn.addEventListener('click', () => {
  window.location.href = `${API_AUTH}/google`;
});

// ── Manejar token en URL (callback de Google) ──

function handleUrlToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    saveToken(token);
    // Limpiar la URL
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = '/';
    return true;
  }

  const error = params.get('error');
  if (error) {
    showError(loginError, 'Error al autenticar con Google. Intenta de nuevo.');
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }

  return false;
}

// ── Inicialización ──

async function init() {
  // Si venimos de Google callback, manejamos el token primero
  if (handleUrlToken()) return;

  // Si ya hay sesión activa, redirigir
  await checkExistingSession();
}

init();
