const express = require('express');
const routes = express.Router();
const db = require('../db');

// Produtos F1 System - Loja Completa
const produtosDemo = [
  { id: 1, nome: 'Capacete Ayrton Senna Edição Limitada', preco: 1299.99, imagem: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop', estoque: 25, categoria: 'Equipamentos' },
  { id: 2, nome: 'Macacão Lewis Hamilton Mercedes', preco: 899.99, imagem: 'https://images.unsplash.com/photo-1576637314607-3780e3a2c0d9?w=300&h=200&fit=crop', estoque: 35, categoria: 'Equipamentos' },
  { id: 3, nome: 'Boné Max Verstappen Red Bull', preco: 199.99, imagem: 'https://images.unsplash.com/photo-1612813287323-d9c8ed26e9d8?w=300&h=200&fit=crop', estoque: 120, categoria: 'Acessórios' },
  { id: 4, nome: 'Camiseta Charles Leclerc Ferrari', preco: 249.99, imagem: 'https://images.unsplash.com/photo-1608043152266-dd14e4f7a6e9?w=300&h=200&fit=crop', estoque: 80, categoria: 'Vestuário' },
  { id: 5, nome: 'Luvas Lando Norris McLaren', preco: 349.99, imagem: 'https://images.unsplash.com/photo-1605348532760-6753c246b548?w=300&h=200&fit=crop', estoque: 45, categoria: 'Equipamentos' },
  { id: 6, nome: 'Óculos Sebastian Vettel', preco: 279.99, imagem: 'https://images.unsplash.com/photo-1570545887536-68f22a9a7c98?w=300&h=200&fit=crop', estoque: 60, categoria: 'Acessórios' },
  { id: 7, nome: 'Jaqueta Sergio Perez RB', preco: 599.99, imagem: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=200&fit=crop', estoque: 28, categoria: 'Vestuário' },
  { id: 8, nome: 'Relógio George Russell Mercedes', preco: 1899.99, imagem: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop', estoque: 15, categoria: 'Acessórios' },
  { id: 9, nome: 'Chaveiro Carlos Sainz Ferrari', preco: 89.99, imagem: 'https://images.unsplash.com/photo-1589256184094-7d2527fbdf0e?w=300&h=200&fit=crop', estoque: 200, categoria: 'Acessórios' },
  { id: 10, nome: 'Tênis Oscar Piastri McLaren', preco: 799.99, imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop', estoque: 40, categoria: 'Calçados' },
  { id: 11, nome: 'Caneca F1 Champions 2024', preco: 79.99, imagem: 'https://images.unsplash.com/photo-1570784332178-f995c850c591?w=300&h=200&fit=crop', estoque: 150, categoria: 'Colecionáveis' },
  { id: 12, nome: 'Poster GP Monza 2023', preco: 129.99, imagem: 'https://images.unsplash.com/photo-1608043152251-0c833dd3a4d8?w=300&h=200&fit=crop', estoque: 90, categoria: 'Decoração' },
  { id: 13, nome: 'Miniatura Ferrari SF-23', preco: 399.99, imagem: 'https://images.unsplash.com/photo-1564498515200-b3f977f05097?w=300&h=200&fit=crop', estoque: 65, categoria: 'Colecionáveis' },
  { id: 14, nome: 'Mousepad F1 Circuit', preco: 149.99, imagem: 'https://images.unsplash.com/photo-1576951331269-095586751db6?w=300&h=200&fit=crop', estoque: 110, categoria: 'Acessórios' },
  { id: 15, nome: 'Carregador Wireless Red Bull', preco: 229.99, imagem: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop', estoque: 85, categoria: 'Eletrônicos' },
  { id: 16, nome: 'Mochila Mercedes AMG', preco: 499.99, imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop', estoque: 32, categoria: 'Acessórios' },
  { id: 17, nome: 'Fone Audiophile F1', preco: 999.99, imagem: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop', estoque: 22, categoria: 'Eletrônicos' },
  { id: 18, nome: 'Estojo Canetas Alpine', preco: 119.99, imagem: 'https://images.unsplash.com/photo-1586244694149-6a439067e243?w=300&h=200&fit=crop', estoque: 140, categoria: 'Acessórios' },
  { id: 19, nome: 'Garrafa Térmica Haas', preco: 159.99, imagem: 'https://images.unsplash.com/photo-1521640892806-9821d78559d3?w=300&h=200&fit=crop', estoque: 95, categoria: 'Acessórios' },
  { id: 20, nome: 'Livro História F1', preco: 89.99, imagem: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop', estoque: 175, categoria: 'Livros' }
];

routes.get('/', (req, res) => {
  res.json(produtosDemo);
});

// GET /api/produtos/:id
routes.get('/:id', (req, res) => {
  const produto = produtosDemo.find(p => p.id == req.params.id);
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(produto);
});

// POST /api/produtos - Novo produto
routes.post('/', (req, res) => {
  const novoProduto = {
    id: produtosDemo.length + 1,
    ...req.body
  };
  produtosDemo.push(novoProduto);
  res.status(201).json(novoProduto);
});

// PUT /api/produtos/:id - Editar
routes.put('/:id', (req, res) => {
  const index = produtosDemo.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
  
  produtosDemo[index] = { ...produtosDemo[index], ...req.body };
  res.json(produtosDemo[index]);
});

// DELETE /api/produtos/:id
routes.delete('/:id', (req, res) => {
  const index = produtosDemo.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
  
  produtosDemo.splice(index, 1);
  res.json({ message: 'Produto excluído' });
});

module.exports = routes;
