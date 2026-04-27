const express = require('express');
const corredoresRoutes = express.Router();
const db = require('../db');

// ROTA GET PARA VER OS DADOS DE CORREDORES
corredoresRoutes.get('/', (req, res) => {
    db.query('SELECT * FROM corredores', (err, results) => {
        if (err) {
            console.error('Erro ao buscar os dados: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ROTA PARA CRIAR UM NOVO CORREDOR
corredoresRoutes.post('/', (req, res) => {
    const { nome, email, senha, turma, equipe } = req.body;

    if (!nome || !email || !senha || !turma || !equipe) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = "INSERT INTO corredores (nome, email, senha, turma, equipe) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nome, email, senha, turma, equipe], (err, results) => {
        if (err) {
            console.error('Erro ao criar corredor: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Corredor criado com sucesso', data: results });
    });
});

// ROTA PARA ATUALIZAR UM CORREDOR
corredoresRoutes.put('/:id', (req, res) => {
    const { nome, email, senha, turma, equipe } = req.body;
    const { id } = req.params;

    if (!nome || !email || !senha || !turma || !equipe) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = 'UPDATE corredores SET nome = ?, email = ?, senha = ?, turma = ?, equipe = ? WHERE id = ?';
    db.query(sql, [nome, email, senha, turma, equipe, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar corredor: ', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }
        res.json({ message: 'Corredor atualizado com sucesso' });
    });
});

// ROTA PARA DELETAR UM CORREDOR
corredoresRoutes.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM corredores WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar corredor: ', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }
        res.json({ message: 'Corredor deletado com sucesso' });
    });
});

module.exports = corredoresRoutes;