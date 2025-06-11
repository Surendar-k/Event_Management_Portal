/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const routes = require('./src/routes/routes')

const app = express()
const PORT = 5000

// 1. CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5174', // frontend URL
    credentials: true
  })
)

// 2. Built-in body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 3. Session middleware
app.use(
  session({
    secret: 'eventmanagementportal',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
)

// 4. Static file serving (brochures etc.)
app.use('/uploads', express.static('uploads'))

// 5. Routes
app.use('/api', routes)

// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
