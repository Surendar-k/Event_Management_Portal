/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const routes = require('./src/routes/routes')
const app = express()
const PORT = 5000
const db = require('./src/config/db')

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

app.post('/api/submit-event', async (req, res) => {
  const { event } = req.body.data
  if (!event) return res.status(400).json({ error: 'Missing event data' })

  const keys = [
    'faculty_id',
    'title',
    'selected_college',
    'selected_department',
    'faculty_coordinators',
    'start_date',
    'end_date',
    'num_days',
    'event_nature',
    'other_nature',
    'venue_type',
    'venue',
    'audience',
    'scope',
    'funding_source',
    'other_funding',
    'speakers',
    'participants',
    'guest_services'
  ]

  const values = keys.map((key) => {
    if (key === 'faculty_id') return req.session.user?.faculty_id || null

    // Directly access the keys assuming event object uses snake_case too
    const val = event[key]

    if (Array.isArray(val) || typeof val === 'object') {
      return JSON.stringify(val || null)
    }

    return val || null
  })

  console.log("Final values to insert:", values)

  try {
    const [result] = await db.execute(
      `INSERT INTO event_info (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
      values
    )
    res.json({ success: true, eventId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB insert failed' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
