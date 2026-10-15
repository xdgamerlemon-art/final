import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required for the MongoDB API');
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function closeDB() {
  await mongoose.disconnect();
}
