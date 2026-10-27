
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

// REGISTER A NEW USER
router.post("/register", async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6 || password.length > 72) {
      return res.status(400).json({
        message: "Password must contain 6 to 72 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    // Hash the password before storing it.
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create account.",
    });
  }
});

// LOG IN AN EXISTING USER
router.post("/login", async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    const user = await User.findOne({ email });

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// GET THE CURRENTLY LOGGED-IN USER
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email");

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    return res.status(200).json(publicUser(user));
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load account.",
    });
  }
});

module.exports = router;
