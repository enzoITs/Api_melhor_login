const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

// Allow cross-origin requests (so the frontend can be opened from file:// or other origins)
app.use(cors());

app.use(express.json());

// Serve frontend static files from sibling workspace folder so the front-end can call the API
// Access pages at: http://localhost:<PORT>/front/<file>.html
app.use('/front', express.static(path.join(__dirname, '..', 'front-Login', 'front')));

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

module.exports = app;