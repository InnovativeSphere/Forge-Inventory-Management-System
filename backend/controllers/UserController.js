import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modals/userSchema.js"; // fixed path and ESM-compatible

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/* =======================
   HELPERS
======================= */

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Admin guard
const requireAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied" });
    return false;
  }
  return true;
};

/* =======================
   AUTH
======================= */

export const registerUser = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password,
      role,
      phone,
      profilePicture,
      theme,
    } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        message:
          exists.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
      role: role || "staff",
      phone: phone || null,
      profilePicture: profilePicture || null,
      theme: ["light", "dark"].includes(theme) ? theme : "light",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      user: { ...user.toObject(), password: undefined },
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   SELF
======================= */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, name, email, phone, profilePicture, password, theme } =
      req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: "Username taken" });
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email taken" });
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;
    if (theme && ["light", "dark"].includes(theme)) user.theme = theme;

    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({
      message: "Profile updated",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

export const toggleUserTheme = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.theme = user.theme === "dark" ? "light" : "dark";
    await user.save();

    res.json({ theme: user.theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error toggling theme" });
  }
};

export const updateUserTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["light", "dark"].includes(theme))
      return res.status(400).json({ message: "Invalid theme" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.theme = theme;
    await user.save();

    res.json({ theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating theme" });
  }
};

/* =======================
   ADMIN
======================= */

export const getAllUsers = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .select("-password")
      .lean();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

export const getUserById = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const user = await User.findById(req.query.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

export const updateUserByAdmin = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const user = await User.findById(req.query.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, req.body);
    await user.save();

    res.json({
      message: "User updated",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating user" });
  }
};

export const deleteUser = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const user = await User.findById(req.query.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated (soft delete)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting user" });
  }
};

/* =======================
   JWT MIDDLEWARE
======================= */

export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* =======================
   LOGOUT
======================= */

export const logoutUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Optional: track logout time if field exists (harmless if ignored)
    await User.findByIdAndUpdate(req.user.id, {
      lastLogout: new Date(),
    });

    // JWT is stateless — client must delete token
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during logout" });
  }
};
