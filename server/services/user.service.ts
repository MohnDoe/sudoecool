import 'dotenv/config';

import db from "#server/db";
import * as schema from "#server/db/schema";
import { DiscordAPIUser } from '~~/shared/types/discord';


export class UserService {
  static async syncDiscordUser(user: DiscordAPIUser): Promise<typeof schema.users.$inferSelect> {
    const result = await db
      .insert(schema.users)
      .values({
        discordDiscriminator: user.discriminator,
        discordGlobalUsername: user.global_name,
        discordId: user.id,
        discordUsername: user.username,
      })
      .onConflictDoUpdate({
        target: [schema.users.discordId],
        set: {
          discordDiscriminator: user.discriminator,
          discordGlobalUsername: user.global_name,
          discordUsername: user.username,
        }
      })
      .returning()


    return result[0]!;
  }
}
