import express, {json, urlencoded} from 'express'
import cors from 'cors'
import session from 'express-session'
import initializeDB from './src/config/db.js'
import routes from './src/routes/routes.js'

const app = express()
const PORT = 5000

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

app.use(json())
app.use(urlencoded({extended: true}))

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

// Main route
app.post('/api/submit-event', async (req, res) => {
  const {event} = req.body.data
  if (!event) return res.status(400).json({error: 'Missing event data'})

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
  if (key === 'faculty_id') return req.session.user?.faculty_id;

  const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  const val = event[camelKey];

  if (Array.isArray(val) || typeof val === 'object') {
    return JSON.stringify(val || null);
  }
console.log("Final values to insert:", values);

  return val || null;
});


  try {
    const [result] = await db.execute(
      `INSERT INTO event_info (faculty_id, eventinfo, agenda, financialplanning, foodandtransport, checklist)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        faculty_id,
        JSON.stringify(eventinfo),
        JSON.stringify(agenda),
        JSON.stringify(financialplanning),
        JSON.stringify(foodandtransport),
        JSON.stringify(checklist)
      ]
    )

    res.json({success: true, eventId: result.insertId})
  } catch (err) {
    console.error(err)
    res.status(500).json({error: 'DB insert failed'})
  }
})

// Init DB and start server
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
})
