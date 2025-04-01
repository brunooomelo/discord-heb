import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export type Command<T extends CommandInteraction = CommandInteraction> = {
  data: SlashCommandBuilder | any;
  execute: (interaction: T) => Promise<void>;
};
