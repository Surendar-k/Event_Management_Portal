// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',// your host name
  user: 'root',//your root
  password: 'Surendar@19', // your password
  database: 'shanmughaeventdb', //your db name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;