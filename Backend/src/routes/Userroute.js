import { Router } from "express";
import usermodel from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {config} from "dotenv";
import BlacklistedToken from "../models/blacklistedtoken.js";
config();
const Userroute = Router();
let key = process.env.KEY;

Userroute.get("/", (req, res) => {
  try {
    res.send("this is Userroute");
  } catch (error) {
    console.log(error);
  }
});

Userroute.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.send("Please Fill the details");
    }
    const existuser = await usermodel.findOne({ username: username });

    if (existuser) {
      return res.send("User Already registred please try to login 🔓");
    }

    bcrypt.hash(password, 4, async function (err, hash) {
      if (err) return console.log(err);

      const newuser = new usermodel({ username, email, password: hash });
      await newuser.save();
    });

    res.status(200).send("User Successfully registred");
  } catch (error) {
    console.log(error);
  }
});

Userroute.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide the required details" });
    }

    const checkuser = await usermodel.findOne({ username: username });

    if (!checkuser) {
      return res.status(400).json({ message: "Please try to register." });
    }

    bcrypt.compare(password, checkuser.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error comparing password" });
      }

      if (!result) {
        return res.status(401).json({ message: "Password is wrong" });
      }

      jwt.sign(
        {
          username: checkuser.username,
          role: checkuser.role,
          _id: checkuser._id
        },
        key,
        (err, token) => {
          if (err) {
            return res.status(500).json({ message: "Error while generating token" });
          }

          // Send token and user info to frontend
          return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
              username: checkuser.username,
              role: checkuser.role,
              _id: checkuser._id
            }
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

Userroute.post("/logout", async (req, res) => {
  const header = req.headers.authorization;
  try {
    if (!header) {
      return res.status(401).json({ message: "Token is not provided" });
    }

    const newToken = header.split(" ")[1];

    if (!newToken) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const tokenCheck = await BlacklistedToken.findOne({ exptoken: newToken });

    if (tokenCheck) {
      return res
        .status(400)
        .json({ message: "User is already logged out, try to log in" });
    }

    const blacklistedToken = new BlacklistedToken({ exptoken: newToken });
    await blacklistedToken.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("blacklisted-token-error", error);
  }
});

export default Userroute;
