// src/db/connection.js
// Camada de banco de dados isolada — nenhum outro módulo acessa mysql2 diretamente.

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'mysql',
  database: process.env.DB_NAME     || 'siteAraras',
  waitForConnections: true,
  connectionLimit:    10,
});

// Garante que o banco e todas as tabelas existam na inicialização.
export async function initDB() {
  // Conexão temporária sem database para criar o schema se necessário
  const bootstrap = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'mysql',
  });

  const db = process.env.DB_NAME || 'siteAraras';
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
  await bootstrap.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id    INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS perfis (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT,
      nome       VARCHAR(100),
      bio        TEXT,
      avatar     VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      nome     VARCHAR(100) NOT NULL UNIQUE,
      descricao TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS eventos (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      nome        VARCHAR(100) NOT NULL UNIQUE,
      descricao   TEXT,
      data_evento DATETIME NOT NULL,
      local       VARCHAR(255),
      criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS topicos (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      titulo       VARCHAR(255) NOT NULL,
      conteudo     TEXT NOT NULL,
      user_id      INT,
      categoria_id INT,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      midia        VARCHAR(255),
      FOREIGN KEY (user_id)      REFERENCES usuarios(id)   ON DELETE SET NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS respostas (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      conteudo   TEXT NOT NULL,
      user_id    INT,
      topico_id  INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      midia      VARCHAR(255),
      FOREIGN KEY (user_id)   REFERENCES usuarios(id)  ON DELETE SET NULL,
      FOREIGN KEY (topico_id) REFERENCES topicos(id)   ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seguir (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      seguidor_id INT,
      seguindo_id INT,
      FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (seguindo_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS curtidas_topicos (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT,
      topico_id  INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES usuarios(id)  ON DELETE CASCADE,
      FOREIGN KEY (topico_id) REFERENCES topicos(id)   ON DELETE CASCADE,
      UNIQUE KEY uq_curtida (user_id, topico_id)
    )
  `);

  console.log('✅ Banco de dados inicializado.');
}

export default pool;
