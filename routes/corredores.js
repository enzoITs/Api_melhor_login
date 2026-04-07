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
    const { nome, turma} = req.body;

    if (!nome || !turma) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = "INSERT INTO corredores (nome, turma) VALUES (?, ?)";
    db.query(sql, [nome, turma], (err, results) => {
        if (err) {
            console.error('erro ao criar corredor: ', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Corredor criado com sucesso', data: results });
    })
});

//rota para atualizar um corredor
corredoresRoutes.put('/:id', (req, res) => {
    const { idcorredores, nome, turma } = req.body;
    const { id } = req.params;

    if (!idcorredores || !nome || !turma) {
        return res.status(400).json({error: 'Todos os campos são obrigatórios' });
    }

    const sql = 'UPDATE corredores SET idcorredores = ?, nome = ?, turma = ? WHERE idcorredores = ?'; 
    db.query(sql, [idcorredores, nome, turma, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar corredor: ', err);
            return res.status(500).json({ error: err.message });
        };
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado'})
        }
        res.json({ menssage: 'Corredor atualizado com sucesso' });
        })
})


//rota para deletar um corredor
corredoresRoutes.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM corredores WHERE idcorredores = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar corredor: ', err);
            return res.status(500).json({ error: err.message });
        };
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Corredor não encontrado'})
        }
        res.json({ menssage: 'Corredor deletado com sucesso' });
        })
})

module.exports = corredoresRoutes;    