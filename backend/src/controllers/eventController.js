const db = require("../config/db");

exports.saveEventInfo = async (req, res) => {
  try {
    console.log("🛠 Incoming body:", JSON.stringify(req.body));

    const { eventinfo, agenda, financialplanning, foodandtransport, checklist } = req.body;
    const faculty_id = req.session.user?.faculty_id;

    if (!faculty_id) {
      return res.status(401).json({ error: "Unauthorized: Faculty ID not found in session" });
    }

    // Generate a new event_id if not provided (UUID or timestamp can be used instead)
    const event_id = req.body.event_id || Date.now(); // simple fallback unique ID

    // Normalize values to avoid undefined
    const safeEventInfo = JSON.stringify(eventinfo || {});
    const safeAgenda = JSON.stringify(agenda || {});
    const safeFinance = JSON.stringify(financialplanning || {});
    const safeFood = JSON.stringify(foodandtransport || {});
    const safeChecklist = JSON.stringify(checklist || []);

    // Check if the event already exists
    const [existing] = await db.execute(
      "SELECT event_id FROM event_info WHERE event_id = ?",
      [event_id]
    );

    if (existing.length > 0) {
      // Update existing
      await db.execute(
        `UPDATE event_info SET
          faculty_id = ?,
          eventinfo = ?,
          agenda = ?,
          financialplanning = ?,
          foodandtransport = ?,
          checklist = ?
         WHERE event_id = ?`,
        [
          faculty_id,
          safeEventInfo,
          safeAgenda,
          safeFinance,
          safeFood,
          safeChecklist,
          event_id,
        ]
      );
    } else {
      // Insert new
      await db.execute(
        `INSERT INTO event_info (
          event_id, faculty_id,
          eventinfo, agenda, financialplanning,
          foodandtransport, checklist
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          event_id,
          faculty_id,
          safeEventInfo,
          safeAgenda,
          safeFinance,
          safeFood,
          safeChecklist,
        ]
      );
    }

    res.json({ message: "Event data saved successfully", event_id });
  } catch (error) {
    console.error("Error saving event info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};