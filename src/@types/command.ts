import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export type Command = {
  data: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => Promise<void>;
}