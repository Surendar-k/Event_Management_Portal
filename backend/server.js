const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const routes = require("./src/routes/routes");

const app = express();
const PORT = 5000;

// 1. CORS must be configured BEFORE any routes
app.use(cors({
  origin: "http://localhost:5173", // must match your frontend
  credentials: true, // required for sending cookies
}));

// 2. Body parser for JSON payloads
app.use(bodyParser.json());

// 3. Express-session middleware
app.use(
  session({
    secret: "eventmanagementportal",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true only if using HTTPS
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// 4. Routes after CORS and session
app.use("/api", routes);
app.use('/uploads', express.static('uploads')); // for brochure access

// 5. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
