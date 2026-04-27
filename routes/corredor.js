const express = require('express');
const routes = express.Router();
const db = require('../db');

//CRUD - Create, Read, Update, Delete
//Get all corredores
routes.get('/', (req, res) => {
  db.query('SELECT * FROM corredores', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar corredores' });
    } else {
      res.json(results);
    }
  });
});

//Criar um novo corredor
routes.post('/create', (req, res) => {
  const { nome, turma } = req.body;
  db.query('INSERT INTO corredores (nome, turma) VALUES (?, ?)',
    [nome, turma], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao criar corredor' });
      } else {
        res.status(201).json({ id: results.insertId, nome, turma });
      }
    });
});

//Editar um corredor
routes.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { nome, turma } = req.body;
  db.query('UPDATE corredores SET nome = ?, turma = ? WHERE id = ?',
    [nome, turma, id], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao atualizar corredor' });
      } else {
        res.status(200).json({ id, nome, turma });
      }
    });
});

//Deletar um corredor
routes.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM corredores WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao deletar corredor' });
    } else {
      res.status(200).json({ message: 'Corredor deletado com sucesso' });
    }
  });
});

//Buscar um corredor por id
routes.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM corredores WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar corredor' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Corredor não encontrado' });
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

//Registrar tempo de volta
routes.post('/:id/volta', (req, res) => {
  const { id } = req.params;
  const { tempo } = req.body;
  
  // Primeiro verifica se o corredor existe
  db.query('SELECT * FROM corredores WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar corredor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Corredor não encontrado' });
    } else {
      // Registra a volta
      db.query('INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, NOW(), ?)',
        [tempo, id], (err, results) => {
          if (err) {
            res.status(500).json({ error: 'Erro ao registrar volta' });
          } else {
            res.status(201).json({ 
              id: results.insertId, 
              tempo, 
              corredor_id: id,
              message: 'Volta registrada com sucesso' 
            });
          }
        });
    }
  });
});

//Buscar voltas de um corredor
routes.get('/:id/voltas', (req, res) => {
  const { id } = req.params;
  db.query(`
    SELECT v.*, c.nome as corredor_nome 
    FROM voltas v 
    JOIN corredores c ON v.corredores_id = c.id 
    WHERE v.corredores_id = ? 
    ORDER BY v.data DESC
  `, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar voltas do corredor' });
    } else {
      res.json(results);
    }
  });
});

//Ranking de corredores (melhor tempo)
routes.get('/ranking/melhores-tempos', (req, res) => {
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
    ORDER BY melhor_tempo IS NULL, melhor_tempo ASC
  `, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar ranking' });
    } else {
      res.json(results);
    }
  });
});

module.exports = routes;

// Endpoint para buscar as últimas voltas de todos os corredores
routes.get('/voltas/recentes', (req, res) => {
  // Retorna as 10 voltas mais recentes, com nome do corredor
  const sql = `
    SELECT v.id, v.tempo, v.data, c.nome as corredor_nome, c.turma
    FROM voltas v
    JOIN corredores c ON v.corredores_id = c.id
    ORDER BY v.data DESC
    LIMIT 10
  `;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar voltas recentes' });
    } else {
      res.json(results);
    }
  });
});