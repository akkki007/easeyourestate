import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string; //`mongodb+srv://akshay:${process.env.MONGO_PASS}@products.pmse5.mongodb.net/?appName=Products`

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env or use default local MongoDB");
}
console.log("Connected to MongoDB");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
if (process.env.NODE_ENV !== "production") global.mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (cached.promise) return cached.promise;
  cached.promise = mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
