// db.js
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost', // your host name
  user: 'root', //your root
  password: '12345678', // your password
  database: 'app', //your db name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool
