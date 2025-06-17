/* eslint-disable @typescript-eslint/no-require-imports */
// db.js
const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: 'localhost', // your host nameAdd commentMore actions
  user: 'root', //your root
  password: process.env.DB_PASSWORD, // your password
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool
