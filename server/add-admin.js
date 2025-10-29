
import mongoose from 'mongoose';
import Admin from './models/Admin.js';

import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function addAdmin(fullName, email, password) {
  try {
    await mongoose.connect(MONGO_URI);
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error('Admin with this email already exists.');
      process.exit(1);
    }
    const newAdmin = new Admin({ fullName, email, password });
    await newAdmin.save();
    console.log('✅ New admin added successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error adding admin:', err);
    process.exit(1);
  }
}

const [fullName, email, password] = process.argv.slice(2);
if (!fullName || !email || !password) {
  console.error('Usage: node add-admin.js "Full Name" "email@example.com" "password"');
  process.exit(1);
}

addAdmin(fullName, email, password);

