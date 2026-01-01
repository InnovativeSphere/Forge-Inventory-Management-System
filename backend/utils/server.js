import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env");

// Global cache to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,  // Prevent Mongoose from buffering operations
      // Optional: useUnifiedTopology and useNewUrlParser are default in Mongoose 6+
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    }).catch((err) => {
      cached.promise = null; // Reset promise on failure
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
