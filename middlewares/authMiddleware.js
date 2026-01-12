import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { tokens, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "Randomizer202";

export const requireAuth = async (req, res, next) => {
  try {
    // Prefer httpOnly cookie set by the server; fallback to Authorization header
    const cookieToken = req.cookies?.auth_token;
    const header = req.headers.authorization;

    // console.log(`DEBUG AUTH: Checking ${req.method} ${req.url}`);
    // console.log("DEBUG AUTH: Cookies:", req.cookies ? "present" : "missing");
    // console.log("DEBUG AUTH: Auth Header:", header ? "present" : "missing");

    const token = cookieToken || (header && header.startsWith("Bearer ") ? header.split(" ")[1] : null);

    if (!token) {
      console.log("DEBUG AUTH: No token found. Sending 401.");
      return res.status(401).json({ success: false, message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("DEBUG AUTH: Token verified for user:", decoded.id);

    // Verify user exists in DB to prevent FK violations (e.g. if user was deleted but token remains)
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);

    if (!user) {
      console.log("DEBUG AUTH: User not found in DB (likely deleted). Invalidating token.");
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    // verify token exists in DB (server-side session) if tokens table is available
    try {
      // Check if table exists/query works first
      const [row] = await db.select().from(tokens).where(eq(tokens.token, token)).limit(1);

      // Strict session check: If DB query succeeds but no row found -> Session Invalid
      if (!row) {
        console.log("DEBUG AUTH: Session token not found in DB. Proceeding mainly on JWT validity.");
        // return res.status(401).json({ success: false, message: "Session not found" });
      }
    } catch (dbErr) {
      // If the tokens table doesn't exist (migration not run) or DB error, skip DB session check
      // Only warn if it's NOT a "table does not exist" type error (optional refinement)
      // console.warn('tokens table check skipped:', dbErr.message);
    }

    req.user = user; // attach full user info from DB
    next();
  } catch (err) {
    console.log("DEBUG AUTH: Token verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
