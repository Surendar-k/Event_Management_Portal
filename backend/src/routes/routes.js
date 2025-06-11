/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require("path");
const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");
const agendaController = require("../controllers/agendaController"); // import agenda controller

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});
// ========== Auth Routes ==========
router.post("/login", loginController.login);
router.post("/logout", loginController.logout);
router.get("/session", loginController.session);

// ========== User Management ==========
router.get("/users", authMiddleware.isAuthenticated, loginController.getUsers);
router.post("/users", authMiddleware.isAuthenticated, loginController.createUser);

// ========== Event Routes ==========
router.post("/events", authMiddleware.isAuthenticated, eventController.createEvent);
router.post("/events/:event_id/event-info", authMiddleware.isAuthenticated, eventController.saveEventInfo);
router.get("/events/:event_id", authMiddleware.isAuthenticated, eventController.getFullEvent);


module.exports = router;
