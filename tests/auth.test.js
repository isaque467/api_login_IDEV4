const request = require('supertest');
const jwt = require('jsonwebtoken');

// Importa o app Express montado
const app = require('../app');

// Mock do banco
jest.mock('../db', () => {
  return {
    query: jest.fn()
  };
});

const db = require('../db');

describe('Auth (JWT)', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

  beforeEach(() => {
    db.query.mockReset();
  });

  test('POST /users/create - valida campos obrigatórios', async () => {
    const res = await request(app)
      .post('/users/create')
      .send({ email: 'x@y.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.fieldErrors).toBeDefined();
  });

  test('POST /users/login - retorna token em credenciais válidas', async () => {
    // Mock bcrypt.compare para sempre true
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    // Usuário encontrado (mock do banco)
    db.query.mockImplementation((sql, params, cb) => {
      // express+mysql2 calls: db.query(sql, values, callback)
      const callback = typeof params === 'function' ? params : cb;
      const values = typeof params === 'function' ? [] : params;

      if (typeof callback !== 'function') return;

      if (sql && sql.includes('SELECT * FROM usuarios WHERE email')) {
        return callback(null, [{
          id: 1,
          nome: 'Teste',
          email: values && values[0] ? values[0] : 'x@y.com',
          senha: '$2b$...' // hash real é irrelevante no mock
        }]);
      }
      return callback(null, []);
    });

    const res = await request(app)
      .post('/users/login')
      .send({ email: 'x@y.com', senha: '12345678' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();

    const decoded = jwt.verify(res.body.token, JWT_SECRET);
    expect(decoded.sub).toBe(1);
    expect(decoded.email).toBe('x@y.com');
    expect(decoded.nome).toBe('Teste');
  });

  test('POST /users/login - 401 em credenciais inválidas', async () => {
    db.query.mockImplementation((sql, params, cb) => {
      if (sql.includes('SELECT * FROM usuarios WHERE email')) {
        return cb(null, [{
          id: 1,
          nome: 'Teste',
          email: 'x@y.com',
          senha: '$2b$...'
        }]);
      }
      return cb(null, []);
    });

    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const res = await request(app)
      .post('/users/login')
      .send({ email: 'x@y.com', senha: 'errada' });

    expect(res.statusCode).toBe(401);
  });
});

