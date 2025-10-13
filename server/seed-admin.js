import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const argValue = (flag, fallback = undefined) => {
  const index = process.argv.findIndex((v) => v === flag);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
};

const fullName = argValue("--name", process.env.DEFAULT_ADMIN_NAME || "Admin User");
const email = (argValue("--email", process.env.DEFAULT_ADMIN_EMAIL || "") || "").toLowerCase();
const password = argValue("--password", process.env.DEFAULT_ADMIN_PASSWORD || "");
const force = process.argv.includes("--force");
const cliUri = argValue("--uri");

const mongoUri = cliUri || process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/neopress";

// Validate required credentials
if (!email) {
  console.error("❌ Email is required. Provide it via --email flag or DEFAULT_ADMIN_EMAIL environment variable.");
  process.exit(1);
}

if (!password) {
  console.error("❌ Password is required. Provide it via --password flag or DEFAULT_ADMIN_PASSWORD environment variable.");
  process.exit(1);
}

async function main() {
  try {
    console.log("🔧 Connecting to MongoDB...", mongoUri);
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected");

    const existing = await Admin.findOne({ email });
    if (existing) {
      if (force) {
        existing.fullName = fullName || existing.fullName;
        existing.password = password; // will be hashed by pre-save hook
        await existing.save();
        console.log("✅ Admin password updated for:", existing.email);
      } else {
        console.log("ℹ️ Admin already exists:", existing.email);
        console.log("Use --force to reset the password.");
      }
      console.log("Done.");
      process.exit(0);
    }

    const admin = new Admin({ fullName, email, password });
    await admin.save();
    console.log("✅ Admin created:");
    console.log({ fullName: admin.fullName, email: admin.email, role: admin.role, id: admin._id.toString() });
    console.log("You can now login with these credentials.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err.message || err);
    process.exit(1);
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

main();


