import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, User } from 'discord.js';
import { Command } from '../@types/command';
import { LogService } from '../services/log-service';

export const crime: Command = {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Reporta um crime cometido por um usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('O usuário que cometeu o crime')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('O motivo/descrição do crime')
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const target = interaction.options.get('usuario');
    const reason = interaction.options.get('reason');
    const reporter = interaction.user;

    if (!target?.user || !reason) {
      await interaction.reply({
        content: 'Erro: Usuário ou razão do crime não especificada.',
        ephemeral: true
      });
      return;
    }
    LogService.log(reporter.id, target.user?.id, reason?.value);

    const crimeEmbed = createCrimeEmbed(reporter, target.user, String(reason.value));
    
    await interaction.reply({ embeds: [crimeEmbed] });
  }
};

function createCrimeEmbed(reporter: User, criminal: User, reason: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('🚨 Crime Reportado!')
    .setDescription(`**${criminal.username}** foi reportado por um crime!`)
    .addFields(
      { name: 'Criminoso', value: `<@${criminal.id}>`, inline: true },
      { name: 'Reportado por', value: `<@${reporter.id}>`, inline: true },
      { name: 'Motivo', value: reason }
    )
    .setThumbnail(criminal.displayAvatarURL())
    .setTimestamp();
}