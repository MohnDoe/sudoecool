import type { H3Event, EventHandlerRequest } from "h3";

export async function requireDiscordAuth(event: H3Event<EventHandlerRequest>) {
  const session = await requireUserSession(event);

  event.context.session = session;

  return session;
}
