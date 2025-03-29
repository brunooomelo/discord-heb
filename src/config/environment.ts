import { z } from "zod";

const schema = z.object({
  token: z.string(),
  clientId: z.string(),
  guildId: z.string(),
});

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  ...process.env,
};

export const environment = schema.parse(config);
