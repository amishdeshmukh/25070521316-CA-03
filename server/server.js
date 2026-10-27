
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// 1. MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// ========================================
// 2. MONGODB USER MODEL
// ========================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ========================================
// 3. MONGODB PRODUCT MODEL
// ========================================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      default: "Essentials",
    },

    emoji: {
      type: String,
      default: "🛍️",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

// ========================================
// 4. JWT AUTHENTICATION MIDDLEWARE
// ========================================

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in first.",
    });
  }

  const token = authorization.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login session.",
    });
  }
}

// Create a login token
function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Return safe user details without the password hash
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

// ========================================
// 5. HOME AND HEALTH ROUTES
// ========================================

app.get("/", (req, res) => {
  res.send("Welcome to the ShopLite E-commerce Backend!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce server is running!",
  });
});

// ========================================
// 6. USER REGISTRATION
// POST /api/auth/register
// ========================================

app.post("/api/auth/register", async (req, res) => {
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
        message: "Enter a valid email address.",
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

    // Hash the password before saving it
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

// ========================================
// 7. USER LOGIN
// POST /api/auth/login
// ========================================

app.post("/api/auth/login", async (req, res) => {
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

    return res.json({
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

// ========================================
// 8. GET CURRENT LOGGED-IN USER
// GET /api/auth/me
// ========================================

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email"
    );

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    return res.json(publicUser(user));
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load account.",
    });
  }
});

// ========================================
// 9. GET AND SEARCH PRODUCTS
// GET /api/products
// GET /api/products?search=home
// ========================================

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

app.get("/api/products", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 80)
        : "";

    const filter = search
      ? {
          $or: [
            {
              name: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
            {
              category: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
            {
              description: {
                $regex: escapeRegex(search),
                $options: "i",
              },
            },
          ],
        }
      : {};

    const products = await Product.find(filter)
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("Product error:", error.message);

    return res.status(500).json({
      message: "Unable to load products.",
    });
  }
});

// ========================================
// 10. ADD SAMPLE PRODUCTS
// Runs when the product collection is empty
// ========================================

async function seedProducts() {
  const count = await Product.countDocuments();

  if (count > 0) {
    console.log("Products already exist in MongoDB.");
    return;
  }

  await Product.insertMany([
    {
      name: "Wireless Headphones",
      description: "Enjoy your favorite music.",
      price: 1499,
      category: "Electronics",
      emoji: "🎧",
    },
    {
      name: "Classic Sneakers",
      description: "Comfortable everyday footwear.",
      price: 2199,
      category: "Fashion",
      emoji: "👟",
    },
    {
      name: "Smart Watch",
      description: "A smart companion for your day.",
      price: 2999,
      category: "Electronics",
      emoji: "⌚",
    },
    {
      name: "Coffee Mug",
      description: "A little joy in every sip.",
      price: 349,
      category: "Home",
      emoji: "☕",
    },
    {
      name: "Travel Backpack",
      description: "Carry your essentials in style.",
      price: 1299,
      category: "Accessories",
      emoji: "🎒",
    },
    {
      name: "Desk Lamp",
      description: "Light up your workspace.",
      price: 799,
      category: "Home",
      emoji: "💡",
    },
    {
      name: "Sunglasses",
      description: "An everyday style essential.",
      price: 599,
      category: "Fashion",
      emoji: "🕶️",
    },
    {
      name: "Plant Pot",
      description: "Add some green to your room.",
      price: 299,
      category: "Home",
      emoji: "🪴",
    },
  ]);

  console.log("8 sample products added to MongoDB.");
}

// ========================================
// 11. CONNECT TO MONGODB AND START SERVER
// ========================================

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from your .env file.");
    process.exit(1);
  }

  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 20
  ) {
    console.error(
      "JWT_SECRET must be at least 20 characters long."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Products: http://localhost:${PORT}/api/products`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
