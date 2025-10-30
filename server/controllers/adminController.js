import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const toSafeUser = (adminDoc) => ({
  _id: adminDoc._id,
  fullName: adminDoc.fullName,
  email: adminDoc.email,
  role: adminDoc.role,
  isActive: adminDoc.isActive,
  createdAt: adminDoc.createdAt,
});

export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Email already exists" });

    const newAdmin = new Admin({ fullName, email, password });
    await newAdmin.save();

    const user = toSafeUser(newAdmin);
    return res.status(201).json({ message: "Admin registered successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', {
      hasEmail: !!req.body.email,
      hasIdentifier: !!req.body.identifier,
      hasPassword: !!req.body.password
    });

    const { email, identifier, password } = req.body;
    const loginId = (email || identifier || "").toString().trim().toLowerCase();
  
    if (!loginId || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: "Email/identifier and password are required" });
    }

    console.log('🔍 Looking for admin with email:', loginId);
    let admin = await Admin.findOne({ email: loginId });
    
    if (!admin) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      admin = await Admin.findOne({ email: { $regex: `^${escapeRegex(loginId)}$`, $options: "i" } });
    }
    
    if (!admin) {
      console.log('❌ Admin not found:', loginId);
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log('✅ Admin found:', admin.email);
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'insecure_dev_secret' : undefined);
    if (!jwtSecret) {
      console.log('❌ JWT secret not configured');
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, jwtSecret, {
      expiresIn: "7d",
    });

    const user = toSafeUser(admin);
    console.log('✅ Login successful for:', admin.email);
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const admin = await Admin.findById(userId);
    if (!admin) return res.status(404).json({ message: "User not found" });

    const user = toSafeUser(admin);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

export default { registerAdmin, loginAdmin, getMe };
