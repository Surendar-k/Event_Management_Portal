const db = require("../config/db");

// Safe JSON parser
const parseJSONField = (field, fallback = {}) => {
  if (!field) return fallback;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return fallback;
    }
  }
  if (typeof field === 'object') return field;
  return fallback;
};

// Save or update event info
exports.saveEventInfo = async (req, res) => {
  try {
    const {
      eventinfo,
      agenda,
      financialplanning,
      foodandtransport,
      checklist,
      status = "draft",
      approvals = {},
      reviews = {},
      event_id,
    } = req.body;

    const faculty_id = req.session.user?.faculty_id;
    if (!faculty_id) {
      return res.status(401).json({ error: "Unauthorized: Faculty ID not found in session" });
    }

    if (event_id) {
      // Update existing event
      const [existing] = await db.execute(
        "SELECT * FROM event_info WHERE event_id = ? AND faculty_id = ?",
        [event_id, faculty_id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found for update" });
      }

      const oldData = existing[0];

      const updatedEventInfo = { ...parseJSONField(oldData.eventinfo), ...eventinfo };
      const updatedAgenda = { ...parseJSONField(oldData.agenda), ...agenda };
      const updatedFinance = { ...parseJSONField(oldData.financialplanning), ...financialplanning };
      const updatedFood = { ...parseJSONField(oldData.foodandtransport), ...foodandtransport };
      const updatedChecklist = Array.isArray(checklist) && checklist.length
        ? checklist
        : parseJSONField(oldData.checklist, []);
      const updatedApprovals = Object.keys(approvals).length
        ? approvals
        : parseJSONField(oldData.approvals, {});
      const updatedReviews = Object.keys(reviews).length
        ? reviews
        : parseJSONField(oldData.reviews, {});

      await db.execute(
        `UPDATE event_info SET
          eventinfo = ?, agenda = ?, financialplanning = ?,
          foodandtransport = ?, checklist = ?, status = ?, approvals = ?, reviews = ?
         WHERE event_id = ? AND faculty_id = ?`,
        [
          JSON.stringify(updatedEventInfo),
          JSON.stringify(updatedAgenda),
          JSON.stringify(updatedFinance),
          JSON.stringify(updatedFood),
          JSON.stringify(updatedChecklist),
          status,
          JSON.stringify(updatedApprovals),
          JSON.stringify(updatedReviews),
          event_id,
          faculty_id,
        ]
      );

      return res.json({ message: "Event updated successfully", event_id });
    } else {
      // Create new event
      const [result] = await db.execute(
        `INSERT INTO event_info (
          faculty_id, eventinfo, agenda, financialplanning,
          foodandtransport, checklist, status, approvals, reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          faculty_id,
          JSON.stringify(eventinfo || {}),
          JSON.stringify(agenda || {}),
          JSON.stringify(financialplanning || {}),
          JSON.stringify(foodandtransport || {}),
          JSON.stringify(checklist || []),
          status,
          JSON.stringify(approvals || {}),
          JSON.stringify(reviews || {})
        ]
      );

      return res.json({ message: "Event created successfully", event_id: result.insertId });
    }
  } catch (error) {
    console.error("❌ Error saving event info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Utility to safely parse JSON fields
const tryParse = (val, fallback = {}) => {
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    console.warn("⚠️ Invalid JSON in DB field:", val);
    return fallback;
  }
};

// Get all events for a faculty user
exports.getEventsByUser = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  if (!facultyId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [rows] = await db.execute(
      `SELECT event_id, eventinfo, agenda, financialplanning, foodandtransport, checklist, reviews
       FROM event_info WHERE faculty_id = ?`,
      [facultyId]
    );

    const events = rows.map((r) => ({
      eventId: r.event_id,
      eventData: {
        eventInfo: tryParse(r.eventinfo, {}),
        agenda: tryParse(r.agenda, {}),
        financialPlanning: tryParse(r.financialplanning, {}),
        foodTransport: tryParse(r.foodandtransport, {}),
        checklist: tryParse(r.checklist, []),
        reviews: tryParse(r.reviews, {})
      },
    }));

    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get a specific event by ID
exports.getEventById = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  const { eventId } = req.params;

  if (!facultyId) {
    return res.status(401).json({ error: "Unauthorized: Faculty ID not found in session" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM event_info WHERE event_id = ? AND faculty_id = ?`,
      [eventId, facultyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const row = rows[0];

    res.json({
      event_id: row.event_id,
      status: row.status,
      eventinfo: tryParse(row.eventinfo, {}),
      agenda: tryParse(row.agenda, {}),
      financialplanning: tryParse(row.financialplanning, {}),
      foodandtransport: tryParse(row.foodandtransport, {}),
      checklist: tryParse(row.checklist, []),
      reviews: tryParse(row.reviews, {})
    });
  } catch (err) {
    console.error("❌ Error fetching event by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  const { eventId } = req.params;

  console.log("🗑️ Deleting event with ID:", eventId, "by faculty:", facultyId);

  if (!facultyId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [result] = await db.execute(
      `DELETE FROM event_info WHERE event_id = ? AND faculty_id = ?`,
      [eventId, facultyId]
    );

    if (result.affectedRows === 0) {
      console.warn("⚠️ Delete failed. No matching event found.");
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};



// GET: /api/user-event/:event_id
exports.getUserWithEvent = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  const { event_id } = req.params;

  if (!facultyId || !event_id) {
    return res.status(400).json({ error: "faculty_id or event_id missing" });
  }

  try {
    const [userRows] = await db.query("SELECT * FROM login_users WHERE faculty_id = ?", [facultyId]);
    const [eventRows] = await db.query("SELECT * FROM event_info WHERE event_id = ? AND faculty_id = ?", [event_id, facultyId]);

    if (userRows.length === 0 || eventRows.length === 0) {
      return res.status(404).json({ error: "User or Event not found" });
    }

    res.json({
      user: userRows[0],
      event: eventRows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
