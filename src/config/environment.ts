import { z } from "zod";

const schema = z.object({
  token: z.string(),
  clientId: z.string(),
  guildId: z.string(),
  crimeChannelId: z.string()
});

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  crimeChannelId: process.env.CRIME_CHANNEL_ID,
  ...process.env,
};

export const environment = schema.parse(config);
