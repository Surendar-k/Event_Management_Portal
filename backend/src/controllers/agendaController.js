const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, "brochure_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single("brochure");

// GET agenda
exports.getAgenda = async (req, res) => {
  try {
    const { event_id } = req.params;

    const [agendaRows] = await db.execute(
      "SELECT objectives, outcomes, brochure_path FROM agenda WHERE event_id = ?",
      [event_id]
    );

    const [sessionRows] = await db.execute(
      "SELECT * FROM sessions WHERE event_id = ? ORDER BY session_date, from_time",
      [event_id]
    );

    res.json({
      objectives: agendaRows[0]?.objectives || "",
      outcomes: agendaRows[0]?.outcomes || "",
      brochure: agendaRows[0]?.brochure_path || null,
      sessions: sessionRows,
    });
  } catch (error) {
    console.error("Error fetching agenda:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST agenda
exports.postAgenda = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { objectives, outcomes, sessions } = req.body;
    const brochurePath = req.file ? req.file.path : null;

    const parsedSessions = JSON.parse(sessions);

    // Upsert agenda
    await db.execute(
      `INSERT INTO agenda (event_id, objectives, outcomes, brochure_path)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE objectives = ?, outcomes = ?, brochure_path = ?`,
      [event_id, objectives, outcomes, brochurePath, objectives, outcomes, brochurePath]
    );

    // Delete old sessions
    await db.execute("DELETE FROM sessions WHERE event_id = ?", [event_id]);

    // Insert new sessions
    for (const sess of parsedSessions) {
      await db.execute(
        `INSERT INTO sessions (event_id, session_date, from_time, to_time, topic, speaker_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          event_id,
          sess.sessionDate,
          sess.fromTime,
          sess.toTime,
          sess.topic,
          sess.speakerName,
        ]
      );
    }

    res.status(200).json({ message: "Agenda saved successfully" });
  } catch (error) {
    console.error("Error saving agenda:", error);
    res.status(500).json({ error: "Failed to save agenda" });
  }
};
