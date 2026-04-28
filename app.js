const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Security and logging
app.use(helmet());
app.use(morgan('combined'));

// Allow cross-origin requests (so the frontend can be opened from file:// or other origins)
app.use(cors());

app.use(express.json());

// Serve frontend static files so the front-end can call the API
// Access pages at: http://localhost:<PORT>/cadastro_login.html and /dashboard.html
app.use(express.static(path.join(__dirname, 'Front_api')));

// Rota de teste
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Rotas de usuário
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);

//Rotas de corredores
const corredoresRoutes = require('./routes/corredores');
app.use('/corredores', corredoresRoutes);

const voltasRoutes = require('./routes/voltas');
app.use('/voltas', voltasRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;