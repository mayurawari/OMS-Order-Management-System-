import usermodel from "../models/usermodel.js"

const role = (roles) => {
  return function(req, res, next) {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "You are not authorized" });
    }
  }
}

export default role;