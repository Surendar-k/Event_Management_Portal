const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

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
