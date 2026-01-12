import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { eq } from "drizzle-orm";

const email = process.argv[2] || "admin@test.com";

const promoteUser = async () => {
    try {
        console.log(`Promoting user with email: ${email}...`);

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            console.error("User not found! Please register the user first via the frontend.");
            process.exit(1);
        }

        await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
        console.log(`User ${email} promoted to admin successfully.`);
        process.exit(0);
    } catch (error) {
        console.error("Error promoting user:", error);
        process.exit(1);
    }
};

promoteUser();
