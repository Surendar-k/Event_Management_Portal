const db = require('../config/db')

// Create base event
exports.createEvent = async (req, res) => {
  try {
    const {faculty_id} = req.session.user
    if (!faculty_id) return res.status(401).json({error: 'Unauthorized'})

    const {title} = req.body

    const [result] = await db.execute(
      'INSERT INTO events (faculty_id, event_title) VALUES (?, ?)',
      [faculty_id, title || null]
    )

    return res.status(201).json({event_id: result.insertId})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
}

// Save or update event_info
exports.saveEventInfo = async (req, res) => {
  try {
    const {event_id} = req.params
    const data = req.body

    const [existing] = await db.execute(
      'SELECT id FROM event_info WHERE event_id = ?',
      [event_id]
    )

    const normalize = val => (val === undefined || val === '' ? null : val)

    const payload = [
      normalize(data.title),
      normalize(data.selected_college),
      normalize(data.selected_department),
      JSON.stringify(data.faculty_coordinators || []),
      normalize(data.start_date),
      normalize(data.end_date),
      normalize(data.num_days),
      normalize(data.event_nature),
      normalize(data.other_nature),
      normalize(data.venue_type),
      normalize(data.venue),
      normalize(data.audience),
      normalize(data.scope),
      normalize(data.funding_source),
      normalize(data.other_funding),
      JSON.stringify(data.speakers || []),
      JSON.stringify(data.participants || {}),
      JSON.stringify(data.guest_services || {})
    ]

    if (existing.length > 0) {
      await db.execute(
        `UPDATE event_info SET
          title = ?, selected_college = ?, selected_department = ?, faculty_coordinators = ?,
          start_date = ?, end_date = ?, num_days = ?, event_nature = ?, other_nature = ?,
          venue_type = ?, venue = ?, audience = ?, scope = ?, funding_source = ?, other_funding = ?,
          speakers = ?, participants = ?, guest_services = ?
         WHERE event_id = ?`,
        [...payload, event_id]
      )
    } else {
      await db.execute(
        `INSERT INTO event_info (
          event_id, title, selected_college, selected_department, faculty_coordinators,
          start_date, end_date, num_days, event_nature, other_nature,
          venue_type, venue, audience, scope, funding_source, other_funding,
          speakers, participants, guest_services
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [event_id, ...payload]
      )
    }

    res.json({message: 'Event info saved'})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
}

// Fetch full event with all data
exports.getFullEvent = async (req, res) => {
  try {
    const {event_id} = req.params

    const [[event]] = await db.execute(
      'SELECT * FROM events WHERE event_id = ?',
      [event_id]
    )
    if (!event) return res.status(404).json({error: 'Event not found'})

    const [[eventInfo]] = await db.execute(
      'SELECT * FROM event_info WHERE event_id = ?',
      [event_id]
    )
    const [agenda] = await db.execute(
      'SELECT * FROM agenda WHERE event_id = ?',
      [event_id]
    )
    const [[financialPlanning]] = await db.execute(
      'SELECT * FROM financial_planning WHERE event_id = ?',
      [event_id]
    )
    const [[foodTravel]] = await db.execute(
      'SELECT * FROM food_travel WHERE event_id = ?',
      [event_id]
    )
    const [checklist] = await db.execute(
      'SELECT * FROM checklist WHERE event_id = ?',
      [event_id]
    )

    res.json({
      event,
      eventInfo,
      agenda,
      financialPlanning,
      foodTravel,
      checklist
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
}
