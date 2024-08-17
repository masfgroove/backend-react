const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'monorail.proxy.rlwy.net',
  database: 'railway',
  password: 'YMDCapmVxXCQYnKrtyhSOpRddhwJSWml',
  port: 28308,
});

// Função para criar a tabela 'items' se ela não existir
const createItemsTable = async () => {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      value NUMERIC NOT NULL
    );
  `;

  try {
    await pool.query(createQuery);
    console.log('Tabela "items" criada ou já existe.');
  } catch (err) {
    console.error('Erro ao criar tabela "items":', err);
  }
};

// Função para criar a tabela 'quesitos' se ela não existir
const createQuesitosTable = async () => {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS quesitos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      nota1 NUMERIC NOT NULL,
      nota2 NUMERIC NOT NULL,
      nota3 NUMERIC NOT NULL,
      nota4 NUMERIC NOT NULL,
      escola VARCHAR(100) NOT NULL
    );
  `;

  try {
    await pool.query(createQuery);
    console.log('Tabela "quesitos" criada ou já existe.');
  } catch (err) {
    console.error('Erro ao criar tabela "quesitos":', err);
  }
};

// Crie as tabelas antes de iniciar o servidor
createItemsTable();
createQuesitosTable();

// Endpoint para obter todos os itens
app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao obter itens:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para adicionar um novo item
app.post('/items', async (req, res) => {
  const { name, value } = req.body;
  try {
    const result = await pool.query('INSERT INTO items (name, value) VALUES ($1, $2) RETURNING *', [name, value]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para obter todos os quesitos
app.get('/quesitos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quesitos');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao obter quesitos:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para deletar um quesito
app.delete('/quesitos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM quesitos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar quesito:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para atualizar um quesito
app.put('/quesitos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, nota1, nota2, nota3, nota4, escola } = req.body;
  try {
    const result = await pool.query(
      'UPDATE quesitos SET nome = $1, nota1 = $2, nota2 = $3, nota3 = $4, nota4 = $5, escola = $6 WHERE id = $7 RETURNING *',
      [nome, nota1, nota2, nota3, nota4, escola, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar quesito:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para adicionar um novo quesito
app.post('/quesitos', async (req, res) => {
  const { nome, nota1, nota2, nota3, nota4, escola } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO quesitos (nome, nota1, nota2, nota3, nota4, escola) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, nota1, nota2, nota3, nota4, escola]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar quesito:', err);
    res.status(500).send('Server Error');
  }
});

// Endpoint para obter o total de pontos por escola
app.get('/total-pontos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT escola, SUM(nota1 + nota2 + nota3 + nota4) as total_pontos
      FROM quesitos
      GROUP BY escola
      ORDER BY total_pontos DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching total points:', err);
    res.status(500).json({ error: 'Erro ao buscar total de pontos.' });
  }
});

// Endpoint para resetar todas as notas para zero
app.post('/reset-notas', async (req, res) => {
  try {
    await pool.query(`
      UPDATE quesitos
      SET nota1 = 0, nota2 = 0, nota3 = 0, nota4 = 0
    `);
    res.status(200).send('Notas redefinidas para zero.');
  } catch (err) {
    console.error('Erro ao redefinir notas:', err);
    res.status(500).send('Erro ao redefinir notas.');
  }
});

const PORT = process.env.PORT || 5000; // Alterado para a porta 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
