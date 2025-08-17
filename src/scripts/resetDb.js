/* eslint-disable no-console */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function dropIfExists(connection, table) {
  await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
}

async function reset() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'postal_corp';

  const rootConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await rootConn.end();

  const connection = await mysql.createConnection({ host, port, user, password, database: dbName, multipleStatements: true });
  console.log('Dropping tables (if exist)...');
  // Drop in dependency order
  await dropIfExists(connection, 'likes');
  await dropIfExists(connection, 'comments');
  await dropIfExists(connection, 'follows');
  await dropIfExists(connection, 'posts');
  await dropIfExists(connection, 'users');
  await dropIfExists(connection, 'SequelizeMeta');
  await connection.end();
  console.log('Database reset complete.');
}

reset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to reset DB:', err);
    process.exit(1);
  });

