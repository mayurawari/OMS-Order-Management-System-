import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedtoken.js";

const Authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  try {
    if (!header) {
      return res.status(401).json({ message: "Token is not provided" });
    }

    const newtoken = header.split(" ")[1];
    if (!newtoken) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const checktoken = await BlacklistedToken.findOne({ exptoken: newtoken });
    if (checktoken) {
      return res.status(401).json({ message: "User is logged out, please login again" });
    }

    jwt.verify(newtoken, process.env.KEY, (err, decoded) => {
      if (err) {
        console.log("auth-token-verification-error", err);
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log("auth-error", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export default Authenticate;
