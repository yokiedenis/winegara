require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Cart = require("../../models/Cart"); // Add Cart model import
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const mongoDbsession = require("connect-mongodb-session")(session);
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);
const store = new mongoDbsession({
  uri: process.env.MONGODB_URI,
  collection: "vercel_sessions",
  expires: 1000 * 60 * 60 * 24 * 2,
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

//for session
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Enable in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_BASE_URL
          : undefined,
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Set-Cookie",
      `session=${req.sessionID}; HttpOnly; Secure; SameSite=None; Path=/`
    );
  }
  next();
});
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

    // // Merge guest cart with user cart
    if (req.session.cart && req.session.cart.length > 0) {
      let userCart = await Cart.findOne({ userId: user._id });

      if (!userCart) {
        userCart = new Cart({ userId: user._id, items: [] });
      }

      for (const sessionItem of req.session.cart) {
        const existingItemIndex = userCart.items.findIndex(
          (item) =>
            item.productId.toString() === sessionItem.productId.toString()
        );
        console.log("cullan", existingItemIndex);
        if (existingItemIndex !== -1) {
          userCart.items[existingItemIndex].quantity += sessionItem.quantity;
          console.log(
            "cullan",
            existingItemIndex.quantity,
            sessionItem.quantity
          );
        } else {
          userCart.items.push({
            productId: sessionItem.productId,
            quantity: sessionItem.quantity,
          });
        }
      }

      await userCart.save();
      req.session.cart = []; // Clear guest cart
    
    }


     //session based auth
    req.session.isAuth=true;
    req.session.user={
        userId:user.id,
        email:user.email,
        username:user.userName,
    };
    await req.session.save();
   // loginUser function
res.status(200).json({
  success: true,
  message: "Logged in successfully",
  user: {
    id: user._id,
    email: user.email,
    userName: user.userName,
    role: user.role
  }
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
    res.clearCookie("connect.sid"); // Replace "connect.sid" with your session cookie name

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}

// Auth Middleware (Session-based)
const authMiddleware = async (req, res, next) => {
  // Check if session is authenticated
  if (!req.session.isAuth) {
    return res.status(401).json("Session expired, please login again");
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
