exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Attach user to request
  }
  next();
};

