import 'dotenv/config';
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

import db from "#server/db";
import * as schema from "#server/db/schema";


export class UserService {
  static async syncUser(user: Omit<DiscordAuth['user'], 'userId'>): Promise<typeof schema.users.$inferSelect> {
    console.log("UserService sync")
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.discordId, user.discordId))
      .limit(1);

    if (existing.length > 0) {
      console.log("User already exists;")
      return existing[0]!
    }

    console.log("User does not exist yet.")
    const newUser = await db
      .insert(schema.users)
      .values({
        discordId: user.discordId,
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    console.log(`User ${newUser[0]!.id} created`)

    return newUser[0]!;
  }
}
