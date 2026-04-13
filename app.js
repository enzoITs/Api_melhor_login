const express = require('express');
const app = express();

app.use(express.json());

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