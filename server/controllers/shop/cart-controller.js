require("dotenv").config();
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const express = require("express");
const session = require("express-session");
const mongoDbsession = require("connect-mongodb-session")(session);
const app = express();
const mongoose = require("mongoose");
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
// Add to Cart - Handles both guests and logged-in users
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // console.log("prody", productId, quantity);
    const userId = req.session.userId; // Get from session
    if (!req.session.cart) {
      req.session.cart = [];
    }
    // console.log("usaid", userId);
    if (!productId || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid data provided!" });
    }

    // Check product existence
    const product = await Product.findById(productId);
    // console.log("produt",product)
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Guest user: handle session cart
    if (!userId) {
      req.session.cart = req.session.cart || [];
      const existingItem = req.session.cart.find(
        (item) => item.productId.toString() === productId.toString()
      );
console.log("exist",existingItem);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        req.session.cart.push({ productId, quantity });
      }

      await req.session.save();
      let populatedItems;
      // Guest: Populate product details from session cart
      populatedItems = await Promise.all(
        req.session.cart.map(async (item) => {
          const product = await Product.findById(item.productId).select(
            "image title price salePrice"
          );
          return product ? { ...item, ...product.toObject() } : null;
        })
      );

      populatedItems = populatedItems.filter((item) => item !== null);
      console.log("Session ID:", req.sessionID);
      console.log("Session data:", req.session);
      // console.log("popy", populatedItems);
      return res.status(200).json({ success: true, data: populatedItems });
    }

    // Logged-in user: handle database cart

    const cart = await Cart.findOne({ userId });
    // console.log("carty",cart)
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[existingItemIndex].quantity += quantity;
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: populateCartItems, // Return array directly instead of wrapping in object
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Fetch Cart Items - Populate product details for guests
const fetchCartItems = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log("useris", userId);
    // Guest: fetch from session and populate product details
    if (!userId) {
      const sessionCart = req.session.cart || [];

      console.log("Guest cart:", sessionCart);
      // Use Promise.all to fetch product details concurrently
      let populatedItems = await Promise.all(
        sessionCart.map(async (item) => {
          const product = await Product.findById(item.productId).select(
            "image title price salePrice"
          );
          console.log("prodit", product);
          if (product) {
            return {
              productId: product._id,
              image: product.image,
              title: product.title,
              price: product.price,
              salePrice: product.salePrice,
              quantity: item.quantity,
            };
          }
          return null; // Return null for invalid products
        })
      );
      populatedItems = populatedItems.filter((item) => item !== null);
      // Update session to remove invalid products
      req.session.cart = populatedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await req.session.save();
      console.log("poop", req.session.cart);
      return res.status(200).json({ success: true, data: populatedItems });
    }
    // Logged-in user: fetch from database
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });
    console.log("cats", cart);
    if (!cart) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Filter out invalid products and update cart
    const validItems = cart.items.filter((item) => item.productId);
    cart.items = validItems;
    await cart.save();

    const formattedItems = cart.items.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));
    console.log("formateed", formattedItems);
    res.status(200).json({ success: true, data: formattedItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Cart Item Quantity - Handle guests and users
const updateCartItemQty = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Guest user
    if (!userId) {
      if (!req.session.cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      const itemIndex = req.session.cart.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      // Check product validity before updating
      const product = await Product.findById(productId);
      if (!product) {
        req.session.cart.splice(itemIndex, 1);
        await req.session.save();
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      req.session.cart[itemIndex].quantity = quantity;
      await req.session.save();

      const populatedItems = await Promise.all(
        req.session.cart.map(async (item) => {
          const product = await Product.findById(item.productId).select(
            "image title price salePrice"
          );
          return product ? { ...item, ...product.toObject() } : null;
        })
      );
      return res.status(200).json({
        success: true,
        data: populatedItems.filter((item) => item !== null),
      });
    }

    // Logged-in user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: populateCartItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Delete Cart Item - Handle guests and users
const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.userId;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Guest user

    if (!userId) {
      if (!req.session.cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      const initialLength = req.session.cart.length;
      req.session.cart = req.session.cart.filter(
        (item) => item.productId.toString() !== productId
      );

      if (req.session.cart.length === initialLength) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      await req.session.save();

      // Populate product details for response
      const populatedItems = await Promise.all(
        req.session.cart.map(async (item) => {
          const product = await Product.findById(item.productId).select(
            "image title price salePrice"
          );
          return product ? { ...item, ...product.toObject() } : null;
        })
      );

      return res.status(200).json({
        success: true,
        data: populatedItems.filter((item) => item !== null),
      });
    }

    // Logged-in user
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });
    // console.log("Cartesy:", cart);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    console.log("Cartic 2", cart.items);
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: populateCartItems, // Return array directly
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};
// saver
//saver 2
//saver 3
module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
};
