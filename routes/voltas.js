const express = require('express');
const voltasRoutes = express.Router();
const db = require('../db');


// 🔹 FUNÇÃO AUXILIAR
function isValidId(id) {
    return id && !isNaN(id);
}


// CONTAGEM POR CORREDOR
voltasRoutes.get('/contagem/:id_corredor', async (req, res) => {
    const { id_corredor } = req.params;

    if (!isValidId(id_corredor)) {
        return res.status(400).json({ erro: 'id_corredor deve ser numérico' });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                c.id AS id_corredor,
                c.nome,
                c.turma,
                c.equipe,
                COUNT(v.id) AS total_voltas
            FROM corredores c
            LEFT JOIN voltas v ON v.corredores_id = c.id
            WHERE c.id = ?
            GROUP BY c.id, c.nome, c.turma, c.equipe
        `, [id_corredor]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ erro: 'Corredor não encontrado' });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao contar voltas:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});


// =========================
// CONTAGEM GERAL
// =========================
router.get('/contagem', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT COUNT(*) AS total_voltas FROM voltas
        `);

        if (!rows || rows.length === 0) {
            return res.json({ total_voltas: 0 });
        }

        res.json({ total_voltas: rows[0].total_voltas });

    } catch (error) {
        console.error('Erro ao contar voltas:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});



// MELHOR VOLTA GERAL

voltasRoutes.get('/melhor-volta', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                v.tempo, 
                v.data, 
                c.id AS id_corredor, 
                c.nome, 
                c.turma,
                c.equipe
            FROM voltas v
            JOIN corredores c ON v.corredores_id = c.id
            ORDER BY v.tempo ASC
            LIMIT 1
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma volta registrada' });
        }

        const r = rows[0];

        res.json({
            melhor_volta: r.tempo,
            data: r.data,
            corredor: {
                id: r.id_corredor,
                nome: r.nome,
                turma: r.turma,
                equipe: r.equipe
            }
        });

    } catch (error) {
        console.error('Erro melhor volta geral:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});



// MELHOR VOLTA POR CORREDOR
voltasRoutes.get('/melhor/:id_corredor', async (req, res) => {
    const { id_corredor } = req.params;

    if (!isValidId(id_corredor)) {
        return res.status(400).json({ erro: 'id_corredor deve ser numérico' });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                v.tempo, 
                v.data, 
                c.id AS id_corredor, 
                c.nome, 
                c.turma,
                c.equipe
            FROM voltas v
            JOIN corredores c ON v.corredores_id = c.id
            WHERE c.id = ?
            ORDER BY v.tempo ASC
            LIMIT 1
        `, [id_corredor]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma volta encontrada para este corredor' });
        }

        const r = rows[0];

        res.json({
            id_corredor,
            melhor_volta: r.tempo,
            data: r.data,
            corredor: {
                nome: r.nome,
                turma: r.turma,
                equipe: r.equipe
            }
        });

    } catch (error) {
        console.error('Erro melhor volta corredor:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});



// TOP 5 MELHORES VOLTAS
voltasRoutes.get('/top5-voltas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.id AS id_corredor,
                c.nome,
                c.turma,
                c.equipe,
                v.tempo,
                v.data
            FROM voltas v
            JOIN corredores c ON v.corredores_id = c.id
            ORDER BY v.tempo ASC
            LIMIT 5
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma volta registrada' });
        }

        const ranking = rows.map((row, index) => ({
            rank: index + 1,
            id_corredor: row.id_corredor,
            nome: row.nome,
            turma: row.turma,
            equipe: row.equipe,
            tempo: row.tempo,
            data: row.data
        }));

        res.json({ ranking });

    } catch (error) {
        console.error('Erro top 5:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});



// RANKING GERAL
voltasRoutes.get('/ranking', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                c.id AS id_corredor,
                c.nome,
                c.turma,
                c.equipe,
                v.tempo AS melhor_volta,
                v.data AS data_volta
            FROM corredores c
            JOIN voltas v ON v.id = (
                SELECT id 
                FROM voltas 
                WHERE corredores_id = c.id 
                ORDER BY tempo ASC 
                LIMIT 1
            )
            ORDER BY v.tempo ASC
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma volta registrada' });
        }

        const ranking = rows.map((row, index) => ({
            rank: index + 1,
            id_corredor: row.id_corredor,
            nome: row.nome,
            turma: row.turma,
            equipe: row.equipe,
            melhor_volta: row.melhor_volta,
            data_volta: row.data_volta
        }));

        res.json({ ranking });

    } catch (error) {
        console.error('Erro ranking:', error.message);
        res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
    }
});


module.exports = voltasRoutes;