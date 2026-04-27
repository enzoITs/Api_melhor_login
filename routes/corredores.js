const express = require('express');
const bcrypt = require('bcrypt');
const corredoresRoutes = express.Router();
const db = require('../db');
const verificarToken = require('../middleware/auth');

// ==========================================
// ROTAS DE CRUD
// ==========================================

// ROTA PARA CRIAR UM NOVO CORREDOR (Registro - Não protegida por token)
corredoresRoutes.post('/', async (req, res) => {
    const { nome, email, senha, turma, equipe } = req.body;

    if (!nome || !email || !senha || !turma || !equipe) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const [results] = await db.query(
            "INSERT INTO corredores (nome, email, senha, turma, equipe) VALUES (?, ?, ?, ?, ?)",
            [nome, email, senhaHash, turma, equipe]
        );

        res.status(201).json({ message: 'Corredor criado com sucesso', id: results.insertId });
    } catch (err) {
        console.error('Erro ao criar corredor: ', err);
        return res.status(500).json({ error: err.message });
    }
});

// ROTA GET PARA VER OS DADOS DE CORREDORES (Protegida)
corredoresRoutes.get('/', verificarToken, async (req, res) => {
    try {
        const [results] = await db.query('SELECT id, nome, email, turma, equipe FROM corredores');
        res.json(results);
    } catch (err) {
        console.error('Erro ao buscar os dados: ', err);
        return res.status(500).json({ error: err.message });
    }
});

// ROTA PARA ATUALIZAR UM CORREDOR (Protegida)
corredoresRoutes.put('/:id', verificarToken, async (req, res) => {
    const { nome, email, senha, turma, equipe } = req.body;
    const { id } = req.params;

    if (!nome || !email || !senha || !turma || !equipe) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const [results] = await db.query(
            'UPDATE corredores SET nome = ?, email = ?, senha = ?, turma = ?, equipe = ? WHERE id = ?',
            [nome, email, senhaHash, turma, equipe, id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }
        res.json({ message: 'Corredor atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar corredor: ', err);
        return res.status(500).json({ error: err.message });
    }
});

// ROTA PARA DELETAR UM CORREDOR (Protegida)
corredoresRoutes.delete('/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('DELETE FROM corredores WHERE id = ?', [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado' });
        }
        res.json({ message: 'Corredor deletado com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar corredor: ', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = corredoresRoutes;

