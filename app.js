const express = require('express');
const app = express();

app.use(express.json());

// CORS para permitir requisições do frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//Rotas
const userRoutes = require('./routes/users');
const corredorRoutes = require('./routes/corredor');
app.use('/users', userRoutes);
app.use('/corredores', corredorRoutes);

module.exports = app;