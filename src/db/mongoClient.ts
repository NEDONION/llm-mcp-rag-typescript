import mongoose from 'mongoose';
import { logTitle } from '../utils';
import 'dotenv/config'

logTitle('MongoDB');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const DATABASE_URL = process.env.DATABASE_URL!

export async function connectMongo() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('MongoDB connected:', DATABASE_URL);
  }
}

export default mongoose; 