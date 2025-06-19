/* eslint-disable @typescript-eslint/no-require-imports */
const db = require('../config/db')

const parseJSONField = (field, fallback = {}) => {
  if (!field) return fallback
  if (typeof field === 'string') {
    try {
      return JSON.parse(field)
    } catch {
      return fallback
    }
  }
  if (typeof field === 'object') return field
  return fallback
}

const tryParse = (val, fallback = {}) => {
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

//FIXME: if already exists update not insert
exports.saveEventInfo = async (req, res) => {
  try {
    const {
      eventinfo = {},
      agenda = {},
      financialplanning = {},
      foodandtransport = {},
      checklist,
      status = 'draft',
      approvals,
      reviews,
      event_id
    } = req.body

    const faculty_id = req.session.user?.faculty_id
    const role = req.session.user?.role
    const canApprove = ['hod', 'dean', 'principal'].includes(role)

    if (!faculty_id && !canApprove) {
      return res.status(401).json({error: 'Unauthorized'})
    }

    if (event_id) {
      const [existing] = await db.execute(
        'SELECT * FROM event_info WHERE event_id = ?',
        [event_id]
      )
      if (existing.length === 0)
        return res.status(404).json({error: 'Event not found'})

      const old = existing[0]

      const updatedEventInfo = {...parseJSONField(old.eventinfo), ...eventinfo}
      const updatedAgenda = {...parseJSONField(old.agenda), ...agenda}
      const updatedFinance = {
        ...parseJSONField(old.financialplanning),
        ...financialplanning
      }
      const updatedFood = {
        ...parseJSONField(old.foodandtransport),
        ...foodandtransport
      }
      const updatedChecklist = checklist ?? parseJSONField(old.checklist, [])
      const updatedApprovals = approvals ?? parseJSONField(old.approvals, {})
      const updatedReviews = reviews ?? parseJSONField(old.reviews, {})

      await db.execute(
        `UPDATE event_info SET
          eventinfo = ?, agenda = ?, financialplanning = ?,
          foodandtransport = ?, checklist = ?, status = ?, approvals = ?, reviews = ?
         WHERE event_id = ?`,
        [
          JSON.stringify(updatedEventInfo),
          JSON.stringify(updatedAgenda),
          JSON.stringify(updatedFinance),
          JSON.stringify(updatedFood),
          JSON.stringify(updatedChecklist),
          status,
          JSON.stringify(updatedApprovals),
          JSON.stringify(updatedReviews),
          event_id
        ]
      )

      return res.json({message: 'Event updated successfully', event_id})
    } else {
      if (!faculty_id) {
        return res
          .status(403)
          .json({error: 'Only faculty can create new events'})
      }

      const [result] = await db.execute(
        `INSERT INTO event_info (
          faculty_id, eventinfo, agenda, financialplanning,
          foodandtransport, checklist, status, approvals, reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          faculty_id,
          JSON.stringify(eventinfo),
          JSON.stringify(agenda),
          JSON.stringify(financialplanning),
          JSON.stringify(foodandtransport),
          JSON.stringify(checklist ?? []),
          status,
          JSON.stringify(approvals ?? {}),
          JSON.stringify(reviews ?? {})
        ]
      )

      return res.json({
        message: 'Event created successfully',
        event_id: result.insertId
      })
    }
  } catch (error) {
    console.error('❌ Error saving event info:', error)
    res.status(500).json({error: 'Internal server error'})
  }
}

// Get events by role with safe approval checks
exports.getEventsByUser = async (req, res) => {
  const user = req.session.user
  if (!user) return res.status(401).json({error: 'Unauthorized'})

  const {faculty_id, role, department} = user

  try {
    const [rows] = await db.execute(`
      SELECT ei.*, lu.department
      FROM event_info ei
      JOIN login_users lu ON ei.faculty_id = lu.faculty_id
    `)

    const visibleEvents = rows.filter(row => {
      const isCreator = row.faculty_id === faculty_id
      const status = row.status
      const approvals = tryParse(row.approvals, {}) || {}

      if (role === 'faculty') {
        return (
          isCreator || (status === 'approved' && row.department === department)
        )
      }

      if (role === 'hod') {
        // See own created events OR dept events where HOD has to approve OR approved
        return (
          isCreator ||
          (row.department === department &&
            (Object.prototype.hasOwnProperty.call(approvals, 'hod') ||
              status === 'approved'))
        )
      }

      if (role === 'cso' || role === 'principal') {
        return (
          isCreator ||
          Object.prototype.hasOwnProperty.call(approvals, role) ||
          status === 'approved'
        )
      }

      return false
    })

    const events = visibleEvents.map(r => ({
      eventId: r.event_id,
      status: r.status,
      approvals: tryParse(r.approvals, {}),
      eventData: {
        eventInfo: tryParse(r.eventinfo, {}),
        agenda: tryParse(r.agenda, {}),
        financialPlanning: tryParse(r.financialplanning, {}),
        foodTransport: tryParse(r.foodandtransport, {}),
        checklist: tryParse(r.checklist, []),
        reviews: tryParse(r.reviews, {})
      }
    }))

    res.json(events)
  } catch (err) {
    console.error('❌ Error fetching events:', err)
    res.status(500).json({error: 'Failed to fetch events'})
  }
}

exports.getEventsWithApprovals = async (req, res) => {
  const userRole = req.user?.role; // Get from session/middleware

  if (!userRole) {
    return res.status(403).json({ error: 'User role not found in session' });
  }

  const query = `
    SELECT * 
    FROM event_info 
    WHERE approvals IS NOT NULL 
      AND JSON_LENGTH(approvals) > 0;
  `;

  try {
    const [rows] = await db.execute(query);

    const parsedRows = rows
      .map(row => {
        const approvals = tryParse(row.approvals, {});
        const hasRoleInApprovals = Object.keys(approvals).includes(userRole);

        if (!hasRoleInApprovals) return null; // skip if role not in approvals

        return {
          id: row.event_id,
          facultyId: row.faculty_id,
          status: row.status,
          creatorRole: row.creatorRole || 'Unknown',
          creatorEmail: row.creatorEmail || 'Unknown',
          approvals,
          reviews: tryParse(row.reviews, {}),
          eventData: {
            eventInfo: tryParse(row.eventinfo, {}),
            agenda: tryParse(row.agenda, {}),
            financialPlanning: tryParse(row.financialplanning, {}),
            foodTransport: tryParse(row.foodandtransport, {}),
            checklist: tryParse(row.checklist, []),
            reviews: tryParse(row.reviews, {})
          }
        };
      })
      .filter(Boolean); // remove nulls

    res.status(200).json(parsedRows);
  } catch (error) {
    console.error('Error fetching events with approvals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};









exports.getEventById = async (req, res) => {
  const user = req.session.user
  if (!user) return res.status(401).json({error: 'Unauthorized'})

  const {faculty_id, role, department} = user
  const {eventId} = req.params

  try {
    const [rows] = await db.execute(
      `
      SELECT ei.*, lu.department
      FROM event_info ei
      JOIN login_users lu ON ei.faculty_id = lu.faculty_id
      WHERE ei.event_id = ?
    `,
      [eventId]
    )

    if (rows.length === 0)
      return res.status(404).json({error: 'Event not found'})

    const row = rows[0]
    const isCreator = row.faculty_id === faculty_id
    const status = row.status
    const approvals = tryParse(row.approvals, {}) || {}
    const creatorDept = row.department

    let allowed = false

    if (role === 'faculty') {
      allowed =
        isCreator || (status === 'approved' && creatorDept === department)
    } else if (role === 'hod') {
      allowed =
        creatorDept === department &&
        (approvals?.hod !== undefined || status === 'approved')
    } else if (role === 'cso' || role === 'principal') {
      allowed = approvals?.[role] !== undefined || status === 'approved'
    }

    if (!allowed) return res.status(403).json({error: 'Forbidden'})

    res.json({
      event_id: row.event_id,
      status: row.status,
      eventinfo: tryParse(row.eventinfo, {}),
      agenda: tryParse(row.agenda, {}),
      financialplanning: tryParse(row.financialplanning, {}),
      foodandtransport: tryParse(row.foodandtransport, {}),
      checklist: tryParse(row.checklist, []),
      reviews: tryParse(row.reviews, {}),
      approvals: approvals
    })
  } catch (err) {
    console.error('❌ Error fetching event by ID:', err)
    res.status(500).json({error: 'Internal server error'})
  }
}

exports.deleteEvent = async (req, res) => {
  const facultyId = req.session.user?.faculty_id
  const {eventId} = req.params

  if (!facultyId) return res.status(401).json({error: 'Unauthorized'})

  try {
    const [result] = await db.execute(
      'DELETE FROM event_info WHERE event_id = ? AND faculty_id = ?',
      [eventId, facultyId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'Event not found or unauthorized'})
    }

    res.json({message: 'Event deleted'})
  } catch (err) {
    console.error('❌ Delete error:', err)
    res.status(500).json({error: 'Failed to delete event'})
  }
}
