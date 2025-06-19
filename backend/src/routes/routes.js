/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

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
router.post(
  "/users",
  authMiddleware.isAuthenticated,
  loginController.createUser
);

// ========== Event Routes ==========
router.post(
  "/submit-event",
  authMiddleware.isAuthenticated,
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
  eventController.saveEventInfo
);

//inbox
router.get("/with-approvals", authMiddleware.isAuthenticated, eventController.getEventsWithApprovals);
module.exports = router;
