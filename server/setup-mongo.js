import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neopress';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);

mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully!');
  console.log('Database:', mongoose.connection.db.databaseName);
  process.exit(0);
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

