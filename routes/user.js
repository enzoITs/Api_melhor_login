const express = require('express');
const userRoutes = express.Router();
const db = require('../db');  
const bcrypt = require('bcrypt');  
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

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
    const senhaHash = bcrypt.hashSync(senha, 10); // Hash da senha
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senhaHash], (err, results) => {
        if (err) {
            console.error('Erro ao criar usuário: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Usuário criado com sucesso', id: results.insertId });
    });
});

// chave secreta
const JWT_SECRET = process.env.JWT_SECRET;

// LOGIN
userRoutes.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const sql = 'SELECT * FROM users WHERE email = ?';

        db.query(sql, [email], async (err, results) => {
            try {
                if (err) {
                    console.error('Erro no banco: ', err);
                    return res.status(500).json({ error: 'Erro interno no servidor' });
                }

                if (!results || results.length === 0) {
                    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
                }

                const user = results[0];

                const senhaValida = await bcrypt.compare(senha, user.senha);

                if (!senhaValida) {
                    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
                }

                //gerar token JWT
                const token = jwt.sign(
                    {
                        id: user.id_users,
                        email: user.email
                    },
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

            } catch (compareError) {
                console.error('Erro ao comparar senha: ', compareError);
                return res.status(500).json({ error: 'Erro ao processar login' });
            }
        });

    } catch (error) {
        console.error('Erro geral no login: ', error);
        return res.status(500).json({ error: 'Erro inesperado' });
    }
});

// Atualizar via PUT /users/:id     
userRoutes.put('/:id', (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.params;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    const senhaHash = bcrypt.hashSync(senha, 10);

    const sql = 'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id_users = ?';
    db.query(sql, [nome, email, senhaHash, id], (err, results) => {
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

    const sql = 'DELETE FROM users WHERE id_users = ?';
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