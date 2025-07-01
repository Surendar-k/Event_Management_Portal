/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");
const { requireRole } = require("../middleware/requireRole"); // ✅ FIX
const db = require("../config/db"); // ✅ ADD THIS at the top
const fs = require("fs");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);
const brochureStorage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "brochures")); // Folder for brochures
  },
  filename: function (_, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const brochureUpload = multer({
  storage: brochureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  }
});

const headerStorage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "headers")); // ✅ save to /uploads/headers
  },
  filename: function (_, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const headerUpload = multer({
  storage: headerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPG, JPEG allowed"));
    }
    cb(null, true);
  },
});

// Add header image to event_info (only admin allowed)
// Save header image (admin only)
router.post(
  "/admin/upload-header",
  authMiddleware.isAuthenticated,
  requireRole(["admin"]),
  headerUpload.single("logo"),
  async (req, res) => {
    const { college_name } = req.body;
    const logo = req.file;

    if (!college_name || !logo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const imageUrl = `http://localhost:5000/uploads/headers/${logo.filename}`;

    try {
      // 🔍 Check if header for this college already exists
      const [existing] = await db.query(
        "SELECT * FROM event_info WHERE JSON_EXTRACT(eventinfo, '$.college_name') = ?",
        [college_name]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          error: `Header already uploaded for ${college_name}. Only one allowed.`,
        });
      }

      // ✅ Insert header image and college info
      const [result] = await db.query(
        "INSERT INTO event_info (faculty_id, eventinfo, header_image_url) VALUES (?, ?, ?)",
        [
          req.session.user.faculty_id,
          JSON.stringify({ college_name }),
          imageUrl,
        ]
      );

      res.json({
        message: "Header uploaded successfully",
        logoUrl: imageUrl,
        college_name,
        
      });
    } catch (err) {
      console.error("❌ Upload header error:", err);
      res.status(500).json({ error: err.message || "Server Error" });
    }
  }
);
router.get(
  '/admin/uploaded-headers',
  authMiddleware.isAuthenticated,
  requireRole(['admin', 'faculty', 'principal', 'hod', 'cso']),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT eventinfo, header_image_url FROM event_info WHERE header_image_url IS NOT NULL'
      );

      const headers = rows.map(row => {
        let eventInfo = {};
        try {
          if (typeof row.eventinfo === 'string') {
            eventInfo = JSON.parse(row.eventinfo); // ✅ parse if it's a string
          } else if (typeof row.eventinfo === 'object' && row.eventinfo !== null) {
            eventInfo = row.eventinfo; // ✅ already an object
          }
        } catch (parseError) {
          console.error('⚠️ Invalid eventinfo:', row.eventinfo, parseError);
        }

        const collegeKey = (eventInfo.college_name || '').trim().toLowerCase();
       
        const key = `${collegeKey}`; // ✅ normalized composite key

        return {
          key, // ✅ return the key used by frontend
          logoUrl: row.header_image_url,
          college_name: eventInfo.college_name || '',
          
        };
      });

      res.json(headers);
    } catch (err) {
      console.error('❌ Fetch headers error:', err);
      res.status(500).json({ error: 'Failed to fetch headers' });
    }
  }
);
router.put(
  "/admin/uploaded-headers/:college_name",
  authMiddleware.isAuthenticated,
  requireRole(["admin"]),
  headerUpload.single("logo"),
  async (req, res) => {
    const { college_name } = req.params;
    const logo = req.file;

    if (!logo) {
      return res.status(400).json({ error: "Logo file is required" });
    }

    const imageUrl = `http://localhost:5000/uploads/headers/${logo.filename}`;

    try {
      // 1️⃣ Get existing logo from DB
      const [rows] = await db.query(
        "SELECT header_image_url FROM event_info WHERE JSON_EXTRACT(eventinfo, '$.college_name') = ?",
        [college_name]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Header not found for the given college" });
      }

      // 2️⃣ Delete the old file from disk
      const oldLogoUrl = rows[0].header_image_url;
      const oldFilePath = path.join(__dirname, "..", "uploads", "headers", path.basename(oldLogoUrl));

      await unlinkAsync(oldFilePath).catch((err) => {
        console.warn("⚠️ Could not delete old logo:", err.message);
      });

      // 3️⃣ Update DB with new image URL
      const [result] = await db.query(
        "UPDATE event_info SET header_image_url = ? WHERE JSON_EXTRACT(eventinfo, '$.college_name') = ?",
        [imageUrl, college_name]
      );

      res.json({
        message: "Header updated successfully",
        logoUrl: imageUrl
      });
    } catch (err) {
      console.error("❌ Update header error:", err);
      res.status(500).json({ error: err.message || "Server Error" });
    }
  }
);
router.delete(
  "/admin/uploaded-headers/:college_name",
  authMiddleware.isAuthenticated,
  requireRole(["admin"]),
  async (req, res) => {
    const { college_name } = req.params;

    try {
      // 1️⃣ Fetch the existing record to get the image URL
      const [rows] = await db.query(
        "SELECT header_image_url FROM event_info WHERE JSON_EXTRACT(eventinfo, '$.college_name') = ?",
        [college_name]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Header not found for the given college" });
      }

      const logoUrl = rows[0].header_image_url;
      const filePath = path.join(__dirname, "..", "uploads", "headers", path.basename(logoUrl));

      // 2️⃣ Delete the record from DB
      const [result] = await db.query(
        "DELETE FROM event_info WHERE JSON_EXTRACT(eventinfo, '$.college_name') = ?",
        [college_name]
      );

      // 3️⃣ Delete the file from disk
      await unlinkAsync(filePath).catch((err) => {
        console.warn("⚠️ File deletion failed:", err.message);
      });

      res.json({ message: "Header deleted successfully" });
    } catch (err) {
      console.error("❌ Delete header error:", err);
      res.status(500).json({ error: "Server error while deleting header" });
    }
  }
);



// ========== Auth Routes ==========
router.post("/login", loginController.login);
router.post("/logout", loginController.logout);
router.get("/session", loginController.session);

// ========== User Management ==========
router.get("/users", authMiddleware.isAuthenticated, loginController.getUsers);
router.post(
  "/users",
  authMiddleware.isAuthenticated,
  loginController.createUser
);

// ========== Event Routes ==========
router.post(
  "/submit-event",
  authMiddleware.isAuthenticated,
   brochureUpload.single("brochure"), 
  eventController.saveEventInfo
);

// ========== Event Logs ============
router.get(
  "/events/by-user",
  authMiddleware.isAuthenticated,
  eventController.getEventsByUser
);
// get event id to edit
router.get(
  "/events/:eventId",
  authMiddleware.isAuthenticated,
  eventController.getEventById
);
//use for delete an event
router.delete(
  "/events/:eventId",
  authMiddleware.isAuthenticated,
  eventController.deleteEvent
);
//use for event update
router.put(
  "/events/:eventId",
  authMiddleware.isAuthenticated,
   brochureUpload.single("brochure"),
  eventController.saveEventInfo
);
router.get(
  "/draft-logs",
  authMiddleware.isAuthenticated, // ensure user is logged in
  eventController.getDraftEventsForLogs
);

router.post(
  "/api/users",
  authMiddleware.isAuthenticated,
  requireRole(["principal", "hod", "cso"]),
  loginController.createUser
);

//inbox
router.get(
  "/with-approvals",
  authMiddleware.isAuthenticated,
  eventController.getEventsWithApprovals
);

// In your routes file (e.g., routes/eventRoutes.js)
router.put(
  "/events/:eventId/report",
  authMiddleware.isAuthenticated,
  eventController.updateEventReport
);

console.log(" Routes file loaded");

router.get(
  "/names",
  authMiddleware.isAuthenticated,
  eventController.getFacultyNames
);
module.exports = router;
