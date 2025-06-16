// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost", // your host nameAdd commentMore actions
  user: "root", //your root
  password: "Surendar@19", // your password
  database: "shanmughaeventdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
