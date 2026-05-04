const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS para permitir requisições do frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Servir frontend como arquivos estáticos
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

//Rotas
const userRoutes = require('./routes/users');
const corredorRoutes = require('./routes/corredor');
const dashboardRoutes = require('./routes/dashboard');
const podioRoutes = require('./routes/podio');
const frontendRoutes = require('./routes/frontend');
const produtosRoutes = require('./routes/produtos');
app.use('/users', userRoutes);
app.use('/produtos', produtosRoutes);
app.use('/corredores', corredorRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/podio', podioRoutes);
app.use('/', frontendRoutes);

// Redirecionar raiz para o login
app.get('/', (req, res) => {
  res.redirect('/pages/login.html');
});

module.exports = app;
