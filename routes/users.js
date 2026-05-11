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

const jwt = require('jsonwebtoken');

// Login de usuário (JWT)
routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      message: 'Email e senha são obrigatórios',
      fieldErrors: {
        email: !email ? 'Email é obrigatório' : undefined,
        senha: !senha ? 'Senha é obrigatória' : undefined
      }
    });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      message: 'E-mail inválido',
      fieldErrors: { email: 'Informe um e-mail válido.' }
    });
  }

  if (typeof senha !== 'string' || senha.length < 1) {
    return res.status(400).json({
      message: 'Senha inválida',
      fieldErrors: { senha: 'Informe sua senha.' }
    });
  }

  try {
    db.query('SELECT * FROM usuarios WHERE email = ?', [email.trim()], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao fazer login' });
      }

      if (!results || results.length === 0) {
        return res.status(401).json({
          message: 'Credenciais inválidas',
          fieldErrors: { email: 'E-mail ou senha incorretos.' }
        });
      }

      const user = results[0];
      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        return res.status(401).json({
          message: 'Credenciais inválidas',
          fieldErrors: { senha: 'E-mail ou senha incorretos.' }
        });
      }

      const { senha: _senha, ...userPublic } = user;

      const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
      const token = jwt.sign(
        { sub: userPublic.id, email: userPublic.email, nome: userPublic.nome },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      return res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        user: userPublic
      });
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//Criar um novo usuario (Register)
routes.post('/create', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      message: 'Nome, e-mail e senha são obrigatórios',
      fieldErrors: {
        nome: !nome ? 'Nome é obrigatório' : undefined,
        email: !email ? 'E-mail é obrigatório' : undefined,
        senha: !senha ? 'Senha é obrigatória' : undefined
      }
    });
  }

  const nomeTrim = typeof nome === 'string' ? nome.trim() : '';
  if (nomeTrim.split(/\s+/).filter(Boolean).length < 2) {
    return res.status(400).json({
      message: 'Nome inválido',
      fieldErrors: { nome: 'Informe nome completo.' }
    });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      message: 'E-mail inválido',
      fieldErrors: { email: 'Informe um e-mail válido.' }
    });
  }

  if (typeof senha !== 'string' || senha.length < 8) {
    return res.status(400).json({
      message: 'Senha inválida',
      fieldErrors: { senha: 'A senha deve ter no mínimo 8 caracteres.' }
    });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nomeTrim, email.trim().toLowerCase(), senhaHash],
      (err, results) => {
        if (err) {
          // Em caso de duplicidade de e-mail, MySQL pode lançar erro de constraint.
          return res.status(409).json({
            message: 'Não foi possível cadastrar',
            fieldErrors: { email: 'Este e-mail já está em uso.' }
          });
        }

        return res.status(201).json({
          id: results.insertId,
          nome: nomeTrim,
          email: email.trim().toLowerCase()
        });
      }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
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