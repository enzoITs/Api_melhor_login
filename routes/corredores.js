const express = require('express');
const corredoresRoutes = express.Router();
const db = require('../db');    

// ROTA GET PARA VER OS DADOS DE CORREDORES
corredoresRoutes.get('/', (req, res) => {
    db.query('SELECT *FROM corredores', (err, results) => {
        if (err) {
            console.error('Error ao buscar os dados: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//rota para criar um novo corredor 
corredoresRoutes.post('/', (req, res) => {
    const { idcorredores, nome, turma} = req.body;

    if (!idcorredores || !nome || !turma) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = "INSERT INTO corredores (idcorredores, nome, turma) VALUES (?, ?, ?)";
    db.query(sql, [idcorredores, nome, turma], (err, results) => {
        if (err) {
            console.error('erro ao criar corredor: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Corredor criado com sucesso', data: results });
    })
});

//rota para atualizar um corredor


module.exports = corredoresRoutes;    