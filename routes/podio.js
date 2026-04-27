const express = require('express');
const routes = express.Router();
const db = require('../db');

// Endpoint /podio - Top 3 corredores
routes.get('/', (req, res) => {
  db.query(`
    SELECT 
      c.id,
      c.nome,
      c.turma,
      MIN(v.tempo) as melhor_tempo,
      COUNT(v.id) as total_voltas
    FROM corredores c
    LEFT JOIN voltas v ON c.id = v.corredores_id
    GROUP BY c.id, c.nome, c.turma
    HAVING melhor_tempo IS NOT NULL
    ORDER BY melhor_tempo ASC
    LIMIT 3
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar pódio' });
    }

    // Formatar dados no formato esperado pelo frontend
    const podio = results.map((row) => ({
      numero: row.id,
      nome: row.nome,
      equipe: row.turma,
      tempo_total: row.melhor_tempo,
      melhor_volta: row.melhor_tempo
    }));

    res.json(podio);
  });
});

module.exports = routes;
