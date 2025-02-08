require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Cart = require("../../models/Cart"); // Add Cart model import
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session")
const mongoDbsession = require("connect-mongodb-session")(session)
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true)
const store = new mongoDbsession({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

//for session
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Enable in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.CLIENT_BASE_URL : undefined
    },
    },
  )
);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));


// Register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email!",
      });
    }

    const hashPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    // Merge guest cart after registration
    if (req.session.cart && req.session.cart.length > 0) {
      const userCart = new Cart({
        userId: newUser._id,
        items: req.session.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      await userCart.save();
      req.session.cart = []; // Clear guest cart
    }

    // Set user session after registration
    req.session.userId = newUser._id;
    await req.session.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found! Please register first",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // Set user session
    req.session.userId = user._id;

    // Merge guest cart with user cart
    if (req.session.cart && req.session.cart.length > 0) {
      let userCart = await Cart.findOne({ userId: user._id });

      if (!userCart) {
        userCart = new Cart({ userId: user._id, items: [] });
      }

      for (const sessionItem of req.session.cart) {
        const existingItemIndex = userCart.items.findIndex((item) => 
          item.productId.toString() === sessionItem.productId.toString()
        );
        console.log("cullan", existingItemIndex);
        if (existingItemIndex !== -1) {
          userCart.items[existingItemIndex].quantity += sessionItem.quantity;
          console.log("cullan", existingItemIndex.quantity, sessionItem.quantity);
        } else {
          userCart.items.push({
            productId: sessionItem.productId,
            quantity: sessionItem.quantity,
          });
        }
      }

      await userCart.save();
      req.session.cart = []; // Clear guest cart
      await req.session.save();
    }

    // Create JWT token (if needed for other services)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Logout
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
    //   res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  });
};

// Auth Middleware (Session-based)
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
