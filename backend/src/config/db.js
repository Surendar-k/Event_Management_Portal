import {createConnection, createPool} from 'mysql2/promise'

async function initialize() {
  const connection = await createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Surendar@19'
  })

  await connection.query('CREATE DATABASE IF NOT EXISTS shanmughaeventdb')
  await connection.end()

  const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'Surendar@19',
    database: 'shanmughaeventdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })

  // Create login_users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS login_users (
      faculty_id INT(4) NOT NULL PRIMARY KEY,
      faculty_name VARCHAR(100) NOT NULL,
      designation VARCHAR(50),
      department VARCHAR(50),
      institution_name VARCHAR(100),
      email VARCHAR(100) NOT NULL UNIQUE,
      role ENUM('faculty', 'hod', 'cso', 'principal') NOT NULL
    );
  `)

  // Create event_info table
  await pool.execute(`CREATE TABLE IF NOT EXISTS event_info (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  eventinfo JSON,
  agenda JSON,
  financialplanning JSON,
  foodandtransport JSON,
  checklist JSON,
  FOREIGN KEY (faculty_id) REFERENCES login_users(faculty_id) ON DELETE CASCADE
);
`)

  console.log('Database and tables ensured.')
  return pool
}

export default initialize
