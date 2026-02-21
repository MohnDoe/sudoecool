import { GameService } from "~~/server/services/game.service";

export default defineEventHandler(async (event) => {
  const { user } = await requireDiscordAuth(event);

  const type = getRouterParam(event, 'type') as 'global' | 'server';

  const date = getQuery(event).date as string | undefined;
  const guildId = user.discord.guildMembership?.guildId;

  if (!date) {
    throw createError({
      statusCode: 400,
      message: "We need the date !"
    })
  }


  const result = await GameService.getLeaderboard(type, date, "speed", user.id, guildId);

  console.log(result)
  return result;
})
