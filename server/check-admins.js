import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI or MONGO_URI environment variable is not set!');
  console.log('\n📝 Please create a .env file in the server directory with:');
  console.log('MONGODB_URI=your_mongodb_connection_string');
  process.exit(1);
}

async function checkAdmins() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const admins = await Admin.find({}).select('email fullName role createdAt');
    
    if (admins.length === 0) {
      console.log('❌ No admins found in the database');
    } else {
      console.log(`✅ Found ${admins.length} admin(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.fullName || 'No Name'}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role || 'admin'}`);
        console.log(`   Created: ${admin.createdAt || 'Unknown'}\n`);
      });
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAdmins();
