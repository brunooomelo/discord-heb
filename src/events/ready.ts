import { Client } from 'discord.js';
import { Event } from './Event.js';

export const ready: Event<'ready'> = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    console.log(`Bot online! Logado como ${client.user?.tag}`);
  }
};