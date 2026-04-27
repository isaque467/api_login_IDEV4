const express = require('express');
const routes = express.Router();
const db = require('../db');

// Endpoint /dashboard - Estatísticas gerais
routes.get('/', (req, res) => {
  // Query para contar usuários
  db.query('SELECT COUNT(*) as total FROM usuarios', (err, usersResult) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar estatísticas de usuários' });
    }

    const total_users = usersResult[0].total;

    // Query para contar corredores
    db.query('SELECT COUNT(*) as total FROM corredores', (err, corredoresResult) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar estatísticas de corredores' });
      }

      const total_corredores = corredoresResult[0].total;

      // Query para contar voltas
      db.query('SELECT COUNT(*) as total FROM voltas', (err, voltasResult) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar estatísticas de voltas' });
        }

        const total_voltas = voltasResult[0].total;

        // Query para encontrar o líder (melhor tempo médio ou melhor tempo único)
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
          LIMIT 1
        `, (err, liderResult) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao buscar líder' });
          }

          const lider = liderResult.length > 0 ? {
            numero: liderResult[0].id,
            nome: liderResult[0].nome,
            turma: liderResult[0].turma,
            tempo_total: liderResult[0].melhor_tempo,
            melhor_volta: liderResult[0].melhor_tempo
          } : null;

          res.json({
            total_users,
            total_corredores,
            total_voltas,
            lider
          });
        });
      });
    });
  });
});

// Endpoint /podio - Top 3 corredores
routes.get('/podio', (req, res) => {
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
    const podio = results.map((row, index) => ({
      numero: row.id,
      nome: row.nome,
      equipe: row.turma,       // mapeia turma -> equipe
      tempo_total: row.melhor_tempo,
      melhor_volta: row.melhor_tempo
    }));

    res.json(podio);
  });
});

module.exports = routes;

