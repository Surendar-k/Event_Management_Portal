/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const routes = require('./src/routes/routes')
const app = express()
const PORT = 5000
const mysql = require('mysql2/promise')

;(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Surendar@19'
  })

  await connection.query(`CREATE DATABASE IF NOT EXISTS app`)
  await connection.changeUser({database: 'app'})

  await connection.query(`
    CREATE TABLE IF NOT EXISTS login_users (
      faculty_id INT NOT NULL,
      faculty_name VARCHAR(100) NOT NULL,
      designation VARCHAR(50) DEFAULT NULL,
      department VARCHAR(50) DEFAULT NULL,
      institution_name VARCHAR(100) DEFAULT NULL,
      email VARCHAR(100) NOT NULL,
      role ENUM('faculty','hod','cso','principal') NOT NULL,
      PRIMARY KEY (faculty_id),
      UNIQUE KEY email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `)

  await connection.query(`
    CREATE TABLE IF NOT EXISTS event_info (
      event_id INT NOT NULL AUTO_INCREMENT,
      faculty_id INT NOT NULL,
      eventinfo JSON DEFAULT NULL,
      agenda JSON DEFAULT NULL,
      financialplanning JSON DEFAULT NULL,
      foodandtransport JSON DEFAULT NULL,
      checklist JSON DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      approvals JSON DEFAULT NULL,
      reviews JSON DEFAULT NULL,
      PRIMARY KEY (event_id),
      KEY faculty_id (faculty_id)
    );
  `)

  await connection.end()
})()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(
  session({
    secret: 'eventmanagementportal',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
)

app.use('/uploads', express.static('uploads'))

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
