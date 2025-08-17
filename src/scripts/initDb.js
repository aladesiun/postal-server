/* eslint-disable no-console */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'postal_corp';

  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
  console.log(`Database ensured: ${dbName}`);
}

createDatabaseIfNotExists()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to ensure database:', err.message);
    process.exit(1);
  });

