const db = require("../config/db");

const parseJSONField = (field, fallback = {}) => {
  if (!field) return fallback;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return fallback;
    }
  }
  if (typeof field === "object") return field;
  return fallback;
};

const tryParse = (val, fallback = {}) => {
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

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
    const role = req.session.user?.role;
    const canApprove = ["hod", "dean", "principal"].includes(role);

    if (!faculty_id && !canApprove) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (event_id) {
      const [existing] = await db.execute(
        "SELECT * FROM event_info WHERE event_id = ?",
        [event_id]
      );
      if (existing.length === 0)
        return res.status(404).json({ error: "Event not found" });

      const oldData = existing[0];

      const updatedEventInfo = {
        ...parseJSONField(oldData.eventinfo),
        ...eventinfo,
      };
      const updatedAgenda = { ...parseJSONField(oldData.agenda), ...agenda };
      const updatedFinance = {
        ...parseJSONField(oldData.financialplanning),
        ...financialplanning,
      };
      const updatedFood = {
        ...parseJSONField(oldData.foodandtransport),
        ...foodandtransport,
      };
      const updatedChecklist = checklist?.length
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
          event_id,
        ]
      );

      return res.json({ message: "Event updated successfully", event_id });
    } else {
      if (!faculty_id) {
        return res
          .status(403)
          .json({ error: "Only faculty can create new events" });
      }

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
          JSON.stringify(reviews || {}),
        ]
      );

      return res.json({
        message: "Event created successfully",
        event_id: result.insertId,
      });
    }
  } catch (error) {
    console.error("Error saving event info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getEventsByUser = async (req, res) => {
  const user = req.session.user;
  const { faculty_id, role, department } = user || {};

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let query = `
    SELECT ei.event_id, ei.status, ei.eventinfo, ei.agenda, ei.financialplanning,
           ei.foodandtransport, ei.checklist, ei.approvals, ei.reviews
    FROM event_info ei
    JOIN login_users lu ON ei.faculty_id = lu.faculty_id
  `;

  const conditions = [];
  const params = [];

  // Role-based filtering
  if (role === 'faculty') {
    conditions.push('ei.faculty_id = ?');
    params.push(faculty_id);
  } else if (role === 'hod') {
    conditions.push('lu.department = ?');
    params.push(department);
  } else if (role === 'cso' || role === 'principal') {
    // No filters = access to all events
  } else {
    return res.status(403).json({ error: "Forbidden: Invalid role" });
  }

  // Append WHERE clause if conditions exist
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const [rows] = await db.execute(query, params);

    const events = rows.map((r) => ({
      eventId: r.event_id,
      status: r.status,
      approvals: tryParse(r.approvals, {}),
      eventData: {
        eventInfo: tryParse(r.eventinfo, {}),
        agenda: tryParse(r.agenda, {}),
        financialPlanning: tryParse(r.financialplanning, {}),
        foodTransport: tryParse(r.foodandtransport, {}),
        checklist: tryParse(r.checklist, []),
        reviews: tryParse(r.reviews, {}),
      },
    }));

    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};


exports.getEventById = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  const role = req.session.user?.role;
  const canApprove = ["hod", "dean", "principal"].includes(role);
  const { eventId } = req.params;

  if (!facultyId && !canApprove) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM event_info WHERE event_id = ?",
      [eventId]
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
      reviews: tryParse(row.reviews, {}),
      approvals: tryParse(row.approvals, {}),
    });
  } catch (err) {
    console.error("❌ Error fetching event by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteEvent = async (req, res) => {
  const facultyId = req.session.user?.faculty_id;
  const { eventId } = req.params;

  if (!facultyId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [result] = await db.execute(
      "DELETE FROM event_info WHERE event_id = ? AND faculty_id = ?",
      [eventId, facultyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

