const express = require('express');
const routes = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

//CRUD - Create, Read, Update, Delete
//Get all em usuarios
routes.get('/', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    } else {
      res.json(results);
    }
  });
});

//Login de usuario
routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
    try {
    // Buscar usuário pelo email
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao fazer login' });
      } else {
        if (results.length === 0) {
          res.status(401).json({ error: 'Credenciais inválidas' });
        } else {
          const user = results[0];
          
          // Comparar senha com hash usando bcrypt
          const senhaValida = await bcrypt.compare(senha, user.senha);
          
          if (senhaValida) {
            // Remove a senha da resposta por segurança
            delete user.senha;
            res.status(200).json({ 
              message: 'Login realizado com sucesso',
              user: user
            });
          } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//Criar um novo usuario
routes.post('/create', async (req, res) => {
  const { nome, email, senha } = req.body;
  
  try {
    // Hash da senha usando bcrypt
    const senhaHash = await bcrypt.hash(senha, 10);
    
    db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash], (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao criar usuário' });
        } else {
          res.status(201).json({ id: results.insertId, nome, email });
        }
      });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//editar um usuario
routes.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;
  
  try {
    let senhaHash = senha;
    
    // Se uma nova senha foi fornecida, fazer o hash
    if (senha && senha.length > 0) {
      senhaHash = await bcrypt.hash(senha, 10);
    }
    
    db.query('UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?',
      [nome, email, senhaHash, id], (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao atualizar usuário' });
        } else {
          res.status(200).json({ id, nome, email });
        }
      });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//deletar um usuario
routes.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    } else {
      res.status(201).json({ message: 'Usuário deletado com sucesso' });
    }
  });
});

//Buscar um usuario por id
routes.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Usuário não encontrado' });
      } else {
        res.status(201).json(results[0]);
      }
    }
  });
});

module.exports = routes;