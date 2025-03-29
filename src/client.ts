import { Client, GatewayIntentBits, Collection } from 'discord.js';
import 'dotenv/config';
import { Command } from './@types/command';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

export default client;