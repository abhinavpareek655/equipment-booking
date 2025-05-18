// lib/db.ts
import mongoose from 'mongoose'

// Prevent multiple connections in dev/hot reload
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}
const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null })

/**
 * Connects to MongoDB using Mongoose.
 * Reads the MONGODB_URI env var at call time (not load time).
 */
export async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI as string
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable in .env.local or environment'
    )
  }

  if (cached.conn) {
    return cached.conn
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => mongooseInstance)
  }
  cached.conn = await cached.promise
  return cached.conn
}
