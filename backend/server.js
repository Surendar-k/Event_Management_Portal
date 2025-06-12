import express, {json, urlencoded} from 'express'
import cors from 'cors'
import session from 'express-session'
import initializeDB from './src/config/db'
import routes from './src/routes/routes'

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

  const faculty_id = req.session.faculty_id
  if (!faculty_id) return res.status(401).json({error: 'Unauthorized'})

  try {
    const eventinfo = {
      title: event.title,
      selected_college: event.selectedCollege,
      selected_department: event.selectedDepartment,
      faculty_coordinators: event.selectedCoordinators,
      start_date: event.startDate,
      end_date: event.endDate,
      num_days: event.numDays,
      event_nature: event.eventNature,
      other_nature: event.otherNature,
      venue_type: event.venueType,
      venue: event.venue,
      audience: event.audience,
      scope: event.scope,
      funding_source: event.fundingSource,
      other_funding: event.otherFunding,
      speakers: event.speakers,
      participants: event.participants,
      guest_services: event.guestServices
    }

    const agenda = event.agendaSessions || []
    const financialplanning = event.financialData || {}
    const foodandtransport = event.foodTransportData || {}
    const checklist = event.checklistData || []

    const db = await initializeDB()
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
