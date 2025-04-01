import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  User,
  TextChannel,
} from "discord.js";
import { Command } from "../@types/command";
import { LogService } from "../services/log-service";
import { environment } from "../config/environment";
import { formatDate } from "../utils/formatters";
import { CrimeRepository } from "../repository/crime.repository";

export const crime: Command<CommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription("Reporta um crime cometido por um usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("O usuário que cometeu o crime")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("O motivo/descrição do crime")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    try {
      const target = interaction.options.get("usuario");
      const reason = interaction.options.get("reason");
      const reporter = interaction.user;

      if (!target?.user || !reason?.value) {
        await interaction.reply({
          content: "Erro: Usuário ou razão do crime não especificada.",
          ephemeral: true,
        });
        return;
      }

      if (target?.user?.id === reporter.id) {
        await interaction.reply({
          content: "❌ Você não pode reportar um crime contra si mesmo!",
          ephemeral: true,
        });
        return;
      }

      LogService.log(reporter.id, target.user?.id, reason?.value);

      await CrimeRepository.createCrime(
        reporter,
        target.user,
        reason.value as string
      );

      const crimeCount = await CrimeRepository.getCrimeCount(target.user.id);

      if (environment.crimeChannelId) {
        const logChannel = interaction.client.channels.cache.get(
          environment.crimeChannelId
        ) as TextChannel;

        if (logChannel) {
          const logEmbed = createCrimeEmbed(
            reporter,
            target.user,
            reason.value as string,
            crimeCount
          );
          await logChannel.send({ embeds: [logEmbed] });
          await interaction.reply({
            content:
              "Crime reportado com sucesso",
            ephemeral: true,
          });
        }
      }
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content:
          "Ocorreu um erro ao registrar o crime. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};

function createCrimeEmbed(
  reporter: User,
  criminal: User,
  reason: string,
  crimeCount: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("🚨 Crime Reportado!")
    .setDescription(`**${criminal.username}** foi reportado por um crime!`)
    .addFields(
      {
        name: "Criminoso",
        value: `${criminal.username} (<@${criminal.id}>)`,
        inline: true,
      },
      {
        name: "Reportado por",
        value: `${reporter.username} (<@${reporter.id}>)`,
        inline: true,
      },
      { name: "Motivo", value: reason },
      {
        name: "Ficha Criminal",
        value: `Este usuário possui **${crimeCount} crime${
          crimeCount !== 1 ? "s" : ""
        }** registrado${crimeCount !== 1 ? "s" : ""}.`,
      }
    )
    .setThumbnail(criminal.displayAvatarURL())
    .setFooter({ text: "Sistema de Registro Criminal" })
    .setTimestamp();
}

function createLogEmbed(
  reporter: User,
  criminal: User,
  reason: string,
  crimeCount: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor("#800000")
    .setTitle("📋 Registro Criminal")
    .setDescription(`Um novo crime foi registrado no sistema.`)
    .addFields(
      {
        name: "Criminoso",
        value: `${criminal.username} (<@${criminal.id}>)`,
        inline: true,
      },
      {
        name: "Reportado por",
        value: `${reporter.username} (<@${reporter.id}>)`,
        inline: true,
      },
      { name: "Data", value: formatDate(new Date()), inline: true },
      { name: "Total de Crimes", value: `${crimeCount}`, inline: true },
      { name: "Motivo", value: reason }
    )
    .setThumbnail(criminal.displayAvatarURL())
    .setFooter({ text: "Sistema de Registro Criminal" })
    .setTimestamp();

  return embed;
}
