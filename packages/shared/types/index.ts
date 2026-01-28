export interface DiscordTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    discordId: string;
    userId: string; // Internal database user ID
    username: string;
    avatar: string | null,
  },
}

export type DiscordAuth = DiscordTokenResponse;

export { type Sudoku } from "sudoku-gen/dist/types/sudoku.type";
