import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../middleware/auth.middleware.js";

/**
 * Register a new user (ADMIN only)
 */
export const register = async (req, res) => {
  try {
    const { username, password, role, restaurant, fullName, phone, email } = req.body;
  
      // Require restaurant for STAFF
      if (!restaurant && role !== "ADMIN") {
      return res.status(400).json({ message: "restaurant is required for STAFF" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || "CLIENT",
      restaurant: restaurant || null,  // ADMIN can have no restaurant
      fullName,
      phone,
      email
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        restaurant: user.restaurant,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login - returns JWT token
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        restaurant: user.restaurant 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        restaurant: user.restaurant,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current user info
 */
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("restaurant");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
