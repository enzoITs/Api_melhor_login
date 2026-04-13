const express = require('express');
const userRoutes = express.Router();
const db = require('../db');    

// Rota para listar todos os usuários. Montada em app.js com prefixo '/users',
// então aqui usamos caminho relativo '/' para expor GET /users
userRoutes.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// CRIAR USUÁRIO
// Usamos '/' para criar via POST /users
userRoutes.post('/', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senha], (err, results) => {
        if (err) {
            console.error('Erro ao criar usuário: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Usuário criado com sucesso', id: results.insertId });
    });
});

// Atualizar via PUT /users/:id     
userRoutes.put('/:id', (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.params;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = 'UPDATE users SET nome = ?, email = ?, senha = ? WHERE idtable1 = ?';
    db.query(sql, [nome, email, senha, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar usuário: ', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário atualizado com sucesso' });
    });
});

// Deletar via DELETE /users/:id
userRoutes.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE idtable1 = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao excluir usuário: ', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    });
});

module.exports = userRoutes;    