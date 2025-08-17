const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseName = process.env.DB_NAME || 'postal_corp';
const databaseUser = process.env.DB_USER || 'root';
const databasePassword = process.env.DB_PASSWORD || '';
const databaseHost = process.env.DB_HOST || 'localhost';
const databasePort = Number(process.env.DB_PORT || 3306);
const databaseDialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
  host: databaseHost,
  port: databasePort,
  dialect: databaseDialect,
  logging: false,
  define: {
    underscored: true,
    freezeTableName: false
  }
});

module.exports = { sequelize };
