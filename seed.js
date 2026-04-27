const db = require('./db');

// Inserir corredores de teste
db.query("INSERT INTO corredores (nome, turma) VALUES ('Lewis Hamilton', 'Mercedes'), ('Max Verstappen', 'Red Bull'), ('Charles Leclerc', 'Ferrari')", (err, result) => {
  if (err) { console.error('Erro:', err); process.exit(1); }
  console.log('Corredores inseridos OK');
  
  // Inserir voltas de teste
  const voltas = [
    [1.234, 1], [1.198, 1], [1.245, 1],
    [1.156, 2], [1.189, 2], [1.167, 2],
    [1.312, 3], [1.298, 3]
  ];
  let count = 0;
  voltas.forEach(([tempo, corredor_id]) => {
    db.query('INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, NOW(), ?)', [tempo, corredor_id], (err) => {
      if (err) console.error('Erro volta:', err);
      count++;
      if (count === voltas.length) {
        console.log('Voltas inseridas com sucesso!');
        setTimeout(() => process.exit(0), 500);
      }
    });
  });
});

