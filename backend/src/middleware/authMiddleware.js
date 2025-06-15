exports.isAuthenticated = (req, res, next) => {
  if (req.session?.user?.faculty_id) return next();
  res.status(401).json({ error: "Unauthorized: Please log in first" });
};
