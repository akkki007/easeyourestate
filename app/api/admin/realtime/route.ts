import { NextRequest } from"next/server";
import { dbConnect } from"@/lib/db/connection";
import { verifyToken } from"@/lib/jwt";
import User from"@/lib/db/models/User";
import mongoose from"mongoose";

export const dynamic ="force-dynamic";

// SSE endpoint — streams DB change events to admin clients.
// Tries MongoDB Change Streams first (requires replica set),
// falls back to polling every 3s.
export async function GET(req: NextRequest) {
 // Auth via query param (EventSource can't set headers)
 const token = req.nextUrl.searchParams.get("token");
 if (!token) {
 return new Response("Unauthorized", { status: 401 });
 }

 let decoded: { id?: string; role?: string };
 try {
 decoded = verifyToken(token) as { id?: string; role?: string };
 } catch {
 return new Response("Invalid token", { status: 401 });
 }

 await dbConnect();

 // Verify admin
 const admin = await User.findById(decoded.id).select("role").lean();
 if (!admin || admin.role !=="admin") {
 return new Response("Forbidden", { status: 403 });
 }

 const encoder = new TextEncoder();
 let alive = true;

 const stream = new ReadableStream({
 async start(controller) {
 const send = (event: string, data: unknown) => {
 if (!alive) return;
 try {
 controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
 } catch {
 alive = false;
 }
 };

 // Send initial connected event
 send("connected", { time: Date.now() });

 // Heartbeat — keeps the connection alive & lets client detect drops
 const heartbeat = setInterval(() => {
 if (!alive) { clearInterval(heartbeat); return; }
 send("ping", { time: Date.now() });
 }, 15000);

 // --- Try Change Streams (replica set required) ---
 let usingChangeStreams = false;
 const watchers: mongoose.mongo.ChangeStream[] = [];

 try {
 const db = mongoose.connection.db;
 if (!db) throw new Error("No DB");

 const userWatcher = db.collection("users").watch([], { fullDocument:"updateLookup"});
 const propertyWatcher = db.collection("properties").watch([], { fullDocument:"updateLookup"});
 const reportWatcher = db.collection("reports").watch([], { fullDocument:"updateLookup"});

 // Need to wait for the first getMore to confirm it's actually working
 // The watch() call itself doesn't throw on standalone — the first next() does
 const testPromise = Promise.race([
 userWatcher.hasNext(),
 new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
 ]);

 // If this rejects, change streams aren't available
 await testPromise.catch(() => {
 throw new Error("Change streams not available");
 });

 watchers.push(userWatcher, propertyWatcher, reportWatcher);
 usingChangeStreams = true;
 send("mode", { mode:"changestream"});

 const handleChange = (collection: string) => {
 return (change: mongoose.mongo.ChangeStreamDocument) => {
 if (!alive) return;
 const op = change.operationType; // insert, update, replace, delete
 send("change", { collection, operation: op, time: Date.now() });
 };
 };

 userWatcher.on("change", handleChange("users"));
 propertyWatcher.on("change", handleChange("properties"));
 reportWatcher.on("change", handleChange("reports"));

 // Clean up watchers on close
 userWatcher.on("error", () => { alive = false; });
 propertyWatcher.on("error", () => { alive = false; });
 reportWatcher.on("error", () => { alive = false; });
 } catch {
 // Change Streams not available — use polling fallback
 }

 // --- Polling fallback ---
 let pollInterval: ReturnType<typeof setInterval> | null = null;

 if (!usingChangeStreams) {
 send("mode", { mode:"polling"});

 // Track last-known counts to detect changes
 let lastSnapshot ="";

 const poll = async () => {
 if (!alive) { if (pollInterval) clearInterval(pollInterval); return; }
 try {
 const db = mongoose.connection.db;
 if (!db) return;

 const [userCount, propCount, reportCount, pendingCount] = await Promise.all([
 db.collection("users").countDocuments(),
 db.collection("properties").countDocuments(),
 db.collection("reports").countDocuments(),
 db.collection("properties").countDocuments({ status:"pending_review", deletedAt: null }),
 ]);

 const snapshot =`${userCount}:${propCount}:${reportCount}:${pendingCount}`;
 if (snapshot !== lastSnapshot) {
 lastSnapshot = snapshot;
 send("change", {
 collection:"snapshot",
 operation:"poll",
 counts: { users: userCount, properties: propCount, reports: reportCount, pending: pendingCount },
 time: Date.now(),
 });
 }
 } catch {
 // Ignore poll errors silently
 }
 };

 // Initial snapshot
 await poll();
 pollInterval = setInterval(poll, 3000);
 }

 // Cleanup when client disconnects
 req.signal.addEventListener("abort", () => {
 alive = false;
 clearInterval(heartbeat);
 if (pollInterval) clearInterval(pollInterval);
 for (const w of watchers) {
 try { w.close(); } catch { /* ignore */ }
 }
 });
 },

 cancel() {
 alive = false;
 },
 });

 return new Response(stream, {
 headers: {
"Content-Type":"text/event-stream",
"Cache-Control":"no-cache, no-transform",
 Connection:"keep-alive",
"X-Accel-Buffering":"no", // Disable nginx buffering
 },
 });
}
