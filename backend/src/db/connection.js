// src/db/connection.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../../araras.db'));

// Configurações de performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS perfis (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER,
      nome       TEXT,
      bio        TEXT,
      avatar     TEXT,
      role       TEXT CHECK(role IN ('adm', 'user')) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      banned_until DATETIME,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS categorias (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL UNIQUE,
      descricao TEXT
    );
    CREATE TABLE IF NOT EXISTS eventos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT NOT NULL UNIQUE,
      descricao   TEXT,
      data_evento DATETIME NOT NULL,
      local       TEXT,
      criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS topicos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo       TEXT NOT NULL,
      conteudo     TEXT NOT NULL,
      user_id      INTEGER,
      categoria_id INTEGER,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      midia        TEXT,
      FOREIGN KEY (user_id)      REFERENCES usuarios(id)   ON DELETE SET NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS respostas (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      conteudo   TEXT NOT NULL,
      user_id    INTEGER,
      topico_id  INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      midia      TEXT,
      FOREIGN KEY (user_id)   REFERENCES usuarios(id)  ON DELETE SET NULL,
      FOREIGN KEY (topico_id) REFERENCES topicos(id)   ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS seguir (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      seguidor_id INTEGER,
      seguindo_id INTEGER,
      FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (seguindo_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS curtidas_topicos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER,
      topico_id  INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES usuarios(id)  ON DELETE CASCADE,
      FOREIGN KEY (topico_id) REFERENCES topicos(id)   ON DELETE CASCADE,
      UNIQUE (user_id, topico_id)
    );
    INSERT INTO categorias (nome, descricao) 
    SELECT 'Geral', 'Discussões gerais sobre a comunidade Araras' 
    WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'Geral'); 
  `);
  console.log('✅ Banco de dados inicializado (SQLite).');
}

export default {
  query: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const upper = sql.trimStart().toUpperCase();
      if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA')) {
        const rows = stmt.all(...params);
        return Promise.resolve([rows]);
      } else {
        const info = stmt.run(...params);
        return Promise.resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },
  getConnection: () => {
    // Simula transações com better-sqlite3
    return Promise.resolve({
      beginTransaction: () => db.prepare('BEGIN').run(),
      commit:           () => db.prepare('COMMIT').run(),
      rollback:         () => db.prepare('ROLLBACK').run(),
      query:            (sql, params = []) => {
        const stmt = db.prepare(sql);
        const upper = sql.trimStart().toUpperCase();
        if (upper.startsWith('SELECT')) {
          return Promise.resolve([stmt.all(...params)]);
        }
        const info = stmt.run(...params);
        return Promise.resolve([{ insertId: info.lastInsertRowid }]);
      },
      release: () => {},
    });
  },
};