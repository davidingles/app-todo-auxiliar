// Carga las variables del .env de la raíz (el .env NO se sube a git)
require('dotenv').config({ path: './.env' });

module.exports = {
  apps: [
    {
      name: 'todo-app',
      cwd: './backend',
      script: 'server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        JWT_SECRET: process.env.JWT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  ],
};