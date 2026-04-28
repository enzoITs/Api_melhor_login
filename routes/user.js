const express = require('express');
const userRoutes = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const SALT_ROUNDS = 10;

// Rota para listar todos os usuários (sem senhas)
userRoutes.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT id_users, nome, email FROM users');
        res.json(results);
    } catch (err) {
        console.error('Erro ao buscar usuários: ', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// CRIAR USUÁRIO
userRoutes.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    // email simple validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Email inválido' });

    try {
        // check existing email
        const [existing] = await db.query('SELECT id_users FROM users WHERE email = ?', [email]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
        const [results] = await db.query(
            'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );
        res.status(201).json({ message: 'Usuário criado com sucesso', id: results.insertId });
    } catch (err) {
        console.error('Erro ao criar usuário: ', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// LOGIN
userRoutes.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const user = results[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: user.id_users, email: user.email },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id_users,
                nome: user.nome,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro geral no login: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Atualizar via PUT /users/:id
userRoutes.put('/:id', async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.params;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
        const [results] = await db.query(
            'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id_users = ?',
            [nome, email, senhaHash, id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar usuário: ', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Deletar via DELETE /users/:id
userRoutes.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('DELETE FROM users WHERE id_users = ?', [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err) {
        console.error('Erro ao excluir usuário: ', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = userRoutes;

