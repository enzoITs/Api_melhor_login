const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

console.log('=== INICIANDO APP.JS ===');
console.log('__dirname:', __dirname);

// Security and logging  
// app.use(helmet());  // Temporariamente desabilitado para debug
// app.use(morgan('combined'));  // Removido temporariamente para debug

// Middleware de debug - primeiro middleware para log de TODAS as requisições
app.use((req, res, next) => {
    process.stdout.write(`>>> REQUISIÇÃO: ${req.method} ${req.url}\n`);
    next();
});

// Allow cross-origin requests (so the frontend can be opened from file:// or other origins)
app.use(cors());

app.use(express.json());

// Serve frontend static files so the front-end can call the API
// Access pages at: http://localhost:<PORT>/cadastro_login.html and /dashboard.html
const frontendPath = path.resolve(__dirname, '../Front_api');
console.log('Servindo arquivos estáticos de:', frontendPath);

// Middleware para servir arquivos HTML
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    // Se a requisição é para um arquivo no diretório Front_api
    if (req.path.endsWith('.html') || req.path === '/') {
        const filePath = path.resolve(frontendPath, req.path === '/' ? 'index.html' : req.path.substring(1));
        console.log(`Procurando arquivo: ${filePath}`);
        if (fs.existsSync(filePath)) {
            console.log(`Arquivo encontrado! Servindo: ${filePath}`);
            return res.sendFile(filePath);
        }
    }
    next();
});

// Fallback para static files
app.use(express.static(frontendPath));

// Rota de teste
app.get('/', (req, res) => {
    res.redirect('/cadastro_login.html');
});

// Rotas de usuário
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);

//Rotas de corredores
const corredoresRoutes = require('./routes/corredores');
app.use('/corredores', corredoresRoutes);

const voltasRoutes = require('./routes/voltas');
app.use('/voltas', voltasRoutes);

const clientRoutes = require('./routes/client');
app.use('/api/cliente', clientRoutes);

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