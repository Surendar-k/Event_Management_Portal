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



exports.getEventsByUser = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { faculty_id } = user;

  try {
    // Get only events created by the logged-in user
  const [rows] = await db.execute(
  `SELECT ei.*, lu.faculty_name, lu.role 
   FROM event_info ei 
   JOIN login_users lu ON ei.faculty_id = lu.faculty_id 
   WHERE ei.faculty_id = ?`,
  [faculty_id]
);

const events = rows.map(r => {
  const eventInfo = tryParse(r.eventinfo, {});

  return {
    eventId: r.event_id,
    status: r.status,
    approvals: tryParse(r.approvals, {}),
    creatorRole: r.role || 'Unknown',
    faculty_name: r.faculty_name || 'Unknown',
    startDate: eventInfo.startDate || 'Unknown',  // ✅ from eventInfo
    endDate: eventInfo.endDate || 'Unknown',      // ✅ from eventInfo
    VenueType: eventInfo.venue || eventInfo.location || 'Unknown',  // fallback if `location` missing
    report: tryParse(r.report, {}),
    eventData: {
      eventInfo: eventInfo,
      agenda: tryParse(r.agenda, {}),
      financialPlanning: tryParse(r.financialplanning, {}),
      foodTransport: tryParse(r.foodandtransport, {}),
      checklist: tryParse(r.checklist, []),
      reviews: tryParse(r.reviews, {})
    }
  };
});


    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching events by creator:', err);
    res.status(500).json({ error: 'Failed to fetch user-created events' });
  }
};



exports.getDraftEventsForLogs = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { faculty_id } = user;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM event_info WHERE faculty_id = ? AND status = 'draft'`,
      [faculty_id]
    );

    const events = rows
      .map(r => {
        const approvals = tryParse(r.approvals, {});
        const approverKeys = Object.keys(approvals);

        // If no approvers were selected, show the event (still draft)
        if (approverKeys.length === 0) return r;

        // Check if any of the selected approvers have not yet approved
        const pendingExists = approverKeys.some(key => approvals[key] !== true);

        return pendingExists ? r : null;
      })
      .filter(Boolean); // remove fully-approved draft events

    const mappedEvents = events.map(r => ({
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
    }));

    res.json(mappedEvents);
  } catch (err) {
    console.error('❌ Error fetching draft events for logs:', err);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
};


exports.getEventsWithApprovals = async (req, res) => {
  const user = req.user; // Get from session/middleware

  if (!user || !user.role) {
    return res.status(403).json({ error: 'User role not found in session' });
  }

  const userRole = user.role;
  const userDept = user.department;

  const query = `
    SELECT ei.*, lu.faculty_name, lu.role, lu.department AS creator_dept, lu.email
    FROM event_info ei
    JOIN login_users lu ON ei.faculty_id = lu.faculty_id
    WHERE ei.approvals IS NOT NULL 
      AND JSON_LENGTH(ei.approvals) > 0;
  `;

  try {
    const [rows] = await db.execute(query);

    const parsedRows = rows
      .map(row => {
        const approvals = tryParse(row.approvals, {});
        const hasRoleInApprovals = Object.keys(approvals).includes(userRole);

        // Skip if this user's role is not in the approvals object
        if (!hasRoleInApprovals) return null;

        // Additional filter for HODs: only events from their department
        if (userRole === 'hod' && row.creator_dept !== userDept) {
          return null;
        }

        return {
          id: row.event_id,
          facultyId: row.faculty_id,
          status: row.status,
          creatorRole: row.role || 'Unknown',
          creatorEmail: row.email || 'Unknown',
          faculty_name: row.faculty_name || 'Unknown',
          approvals,
          reviews: tryParse(row.reviews, {}),
          report: tryParse(row.report, {}),
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
      .filter(Boolean); // Remove nulls

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


exports.updateEventReport = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { eventId } = req.params;
  const { report } = req.body;

  try {
    // Convert report to JSON string
    const reportString = JSON.stringify(report);

    const [result] = await db.execute(
      `UPDATE event_info SET report = ? WHERE event_id = ? AND faculty_id = ?`,
      [reportString, eventId, user.faculty_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found or not owned by user' });
    }

    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    console.error('❌ Error updating report:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
};


exports.getFacultyNames = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT faculty_id, faculty_name FROM login_users WHERE role = 'faculty'"
    );
    res.json(rows); // Example: [ { faculty_id: 101, faculty_name: "Dr. Raj" }, ... ]
  } catch (error) {
    console.error("Error fetching faculty names:", error);
    res.status(500).json({ error: "Failed to fetch faculty names" });
  }
};

