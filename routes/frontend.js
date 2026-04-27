const express = require('express');
const routes = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// ========== LOGIN ==========
// POST /login - Frontend espera este endpoint
routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  try {
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao fazer login' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const user = results[0];
      const senhaValida = await bcrypt.compare(senha, user.senha);
      
      if (senhaValida) {
        delete user.senha;
        res.status(200).json({ 
          message: 'Login realizado com sucesso',
          user: user
        });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== CORREDORES ==========
// POST /corredores - Frontend espera este endpoint (em vez de /corredores/create)
routes.post('/corredores', (req, res) => {
  const { nome, numero, equipe } = req.body;
  // Mapeia equipe -> turma (compatibilidade com schema existente)
  const turma = equipe || 'Sem turma';
  
  db.query('INSERT INTO corredores (nome, turma) VALUES (?, ?)',
    [nome, turma], (err, results) => {
      if (err) {
        console.error('Erro ao criar corredor:', err);
        res.status(500).json({ error: 'Erro ao criar corredor' });
      } else {
        res.status(201).json({ 
          id: results.insertId, 
          nome, 
          numero: numero || results.insertId,
          equipe: turma 
        });
      }
    });
});

// ========== VOLTAS ==========
// GET /voltas - Retorna todas as voltas recentes com nome do corredor
routes.get('/voltas', (req, res) => {
  db.query(`
    SELECT 
      v.id,
      v.tempo as tempo_volta,
      v.data as created_at,
      c.id as corredor_id,
      c.nome as corredor_nome,
      c.turma as equipe
    FROM voltas v
    JOIN corredores c ON v.corredores_id = c.id
    ORDER BY v.data DESC
    LIMIT 50
  `, (err, results) => {
    if (err) {
      console.error('Erro ao buscar voltas:', err);
      res.status(500).json({ error: 'Erro ao buscar voltas' });
    } else {
      // Formata para o formato esperado pelo frontend
      const formatted = results.map((v, index) => ({
        id: v.id,
        corredor_nome: v.corredor_nome,
        numero_volta: results.length - index, // aproximação
        tempo_volta: v.tempo_volta,
        created_at: v.created_at
      }));
      res.json(formatted);
    }
  });
});

// POST /voltas - Registra uma volta
routes.post('/voltas', (req, res) => {
  const { corredor_id, numero_volta, tempo_volta } = req.body;
  
  if (!corredor_id || !tempo_volta) {
    return res.status(400).json({ error: 'corredor_id e tempo_volta são obrigatórios' });
  }
  
  // Verifica se corredor existe
  db.query('SELECT * FROM corredores WHERE id = ?', [corredor_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar corredor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Corredor não encontrado' });
    }
    
    // Registra a volta
    db.query('INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, NOW(), ?)',
      [tempo_volta, corredor_id], (err, results) => {
        if (err) {
          console.error('Erro ao registrar volta:', err);
          res.status(500).json({ error: 'Erro ao registrar volta' });
        } else {
          res.status(201).json({ 
            id: results.insertId, 
            corredor_id,
            tempo_volta,
            message: 'Volta registrada com sucesso' 
          });
        }
      });
  });
});

// ========== RANKING ==========
// GET /relatorios/ranking - Retorna ranking formatado para o frontend
routes.get('/relatorios/ranking', (req, res) => {
  db.query(`
    SELECT 
      c.id,
      c.nome,
      c.turma as equipe,
      MIN(v.tempo) as melhor_tempo,
      COUNT(v.id) as total_voltas
    FROM corredores c
    LEFT JOIN voltas v ON c.id = v.corredores_id
    GROUP BY c.id, c.nome, c.turma
    HAVING melhor_tempo IS NOT NULL
    ORDER BY melhor_tempo ASC
  `, (err, results) => {
    if (err) {
      console.error('Erro ao buscar ranking:', err);
      res.status(500).json({ error: 'Erro ao buscar ranking' });
    } else {
      // Formata para o formato esperado pelo frontend
      const formatted = results.map((r, index) => ({
        numero: r.id,
        nome: r.nome,
        equipe: r.equipe || 'Sem turma',
        melhor_volta: r.melhor_tempo,
        tempo_total: r.melhor_tempo, // usando melhor tempo como tempo total
        total_voltas: r.total_voltas
      }));
      res.json(formatted);
    }
  });
});

module.exports = routes;

