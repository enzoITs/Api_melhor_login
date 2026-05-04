// routes/public.js

const express = require('express');
const publicRoutes = express.Router();
const db = require('../db');

// ==========================================
// ROTAS PÚBLICAS - SOMENTE LEITURA
// Sem autenticação necessária
// ==========================================

// RANKING GERAL (melhor volta por corredor)
publicRoutes.get('/ranking', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY v.tempo ASC) AS rank,
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
      return res.status(404).json({ error: 'Nenhuma volta registrada ainda.' });
    }

    return res.json({ ranking: rows });
  } catch (error) {
    console.error('Erro ao buscar ranking público:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// TOP 5 MELHORES VOLTAS
publicRoutes.get('/top5', async (req, res) => {
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
      return res.status(404).json({ error: 'Nenhuma volta registrada ainda.' });
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

    return res.json({ top5: ranking });
  } catch (error) {
    console.error('Erro ao buscar top 5 público:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// MELHOR VOLTA GERAL
publicRoutes.get('/melhor-volta', async (req, res) => {
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
      return res.status(404).json({ error: 'Nenhuma volta registrada ainda.' });
    }

    const r = rows[0];
    return res.json({
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
    console.error('Erro ao buscar melhor volta pública:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// MELHOR VOLTA DE UM CORREDOR ESPECÍFICO
publicRoutes.get('/melhor-volta/:id_corredor', async (req, res) => {
  const { id_corredor } = req.params;

  if (isNaN(Number(id_corredor))) {
    return res.status(400).json({ error: 'id_corredor deve ser numérico' });
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
      return res.status(404).json({ error: 'Corredor não encontrado ou sem voltas registradas.' });
    }

    const r = rows[0];
    return res.json({
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
    console.error('Erro ao buscar melhor volta do corredor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// TOTAL DE VOLTAS GERAL
publicRoutes.get('/contagem', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_voltas FROM voltas');
    const total = rows?.[0]?.total_voltas ?? 0;
    return res.json({ total_voltas: total });
  } catch (error) {
    console.error('Erro ao contar voltas (público):', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// TOTAL DE VOLTAS DE UM CORREDOR
publicRoutes.get('/contagem/:id_corredor', async (req, res) => {
  const { id_corredor } = req.params;

  if (isNaN(Number(id_corredor))) {
    return res.status(400).json({ error: 'id_corredor deve ser numérico' });
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
      return res.status(404).json({ error: 'Corredor não encontrado.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao contar voltas do corredor (público):', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// LISTAR TODOS OS CORREDORES (sem dados sensíveis)
publicRoutes.get('/corredores', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.nome,
        c.turma,
        c.equipe,
        COUNT(v.id) AS total_voltas
      FROM corredores c
      LEFT JOIN voltas v ON v.corredores_id = c.id
      GROUP BY c.id, c.nome, c.turma, c.equipe
      ORDER BY c.nome ASC
    `);

    return res.json({ corredores: rows });
  } catch (error) {
    console.error('Erro ao listar corredores (público):', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PERFIL PÚBLICO DE UM CORREDOR
publicRoutes.get('/corredores/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'id deve ser numérico' });
  }

  try {
    const [[corredor]] = await db.query(`
      SELECT 
        c.id,
        c.nome,
        c.turma,
        c.equipe,
        COUNT(v.id) AS total_voltas,
        MIN(v.tempo) AS melhor_volta
      FROM corredores c
      LEFT JOIN voltas v ON v.corredores_id = c.id
      WHERE c.id = ?
      GROUP BY c.id, c.nome, c.turma, c.equipe
    `, [id]);

    if (!corredor) {
      return res.status(404).json({ error: 'Corredor não encontrado.' });
    }

    // Histórico de voltas do corredor, da mais recente para a mais antiga
    const [voltas] = await db.query(`
      SELECT id, tempo, data
      FROM voltas
      WHERE corredores_id = ?
      ORDER BY data DESC
    `, [id]);

    return res.json({
      corredor: {
        id: corredor.id,
        nome: corredor.nome,
        turma: corredor.turma,
        equipe: corredor.equipe,
        total_voltas: corredor.total_voltas,
        melhor_volta: corredor.melhor_volta
      },
      historico_voltas: voltas
    });
  } catch (error) {
    console.error('Erro ao buscar perfil público do corredor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = publicRoutes;