import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { CrimeRepository } from "../repository/crime.repository";
import { prisma } from "../config/database";
import { Command } from "../@types/command";

export const stats: Command<ChatInputCommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Mostra estatísticas criminais de um usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription(
          "O usuário para verificar estatísticas (padrão: você mesmo)"
        )
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const chatInteraction = interaction as ChatInputCommandInteraction;
    const target =
      chatInteraction.options.getUser("usuario") || chatInteraction.user;

    await interaction.deferReply();

    try {
      await CrimeRepository.findOrCreateUser(target);

      const crimeCount = await CrimeRepository.getCrimeCount(target.id);
      const reportCount = await prisma.crime.count({
        where: { reporterId: target.id },
      });

      const recentCrimes = await prisma.crime.findMany({
        where: { criminalId: target.id },
        orderBy: { createdAt: "desc" },
        take: 5, // Pega os 5 mais recentes
        include: { reporter: true }, // Inclui o repórter
      });
      
      console.log(recentCrimes)
      const embed = new EmbedBuilder()
        .setColor(crimeCount > 0 ? "#FF0000" : "#00FF00")
        .setTitle(`📊 Estatísticas Criminais: ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: "🚨 Crimes Cometidos", value: `${crimeCount}`, inline: true },
          {
            name: "📝 Crimes Reportados",
            value: `${reportCount}`,
            inline: true,
          },
          { name: "🔍 Status", value: getStatusText(crimeCount), inline: true }
        )
        .setTimestamp();

        if (recentCrimes.length > 0) {
          const crimesText = recentCrimes
            .map((crime) => `• "${crime.reason}"`) // Exibe apenas a razão
            .join("\n");
        
          embed.addFields({ name: "🔪 Crimes Recentes", value: crimesText });
        } else if (crimeCount > 0) {
          embed.addFields({
            name: "🔪 Crimes Recentes",
            value: "Informações detalhadas indisponíveis.",
          });
        }
     

      await interaction.editReply({ embeds: [embed] });
      return;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      await interaction.editReply(
        "Ocorreu um erro ao obter as estatísticas. Tente novamente mais tarde."
      );
    }
  },
};

function getStatusText(crimeCount: number): string {
  if (crimeCount === 0) return "✅ Cidadão exemplar";
  if (crimeCount < 3) return "⚠️ Sob observação";
  if (crimeCount < 5) return "🔴 Atividade suspeita";
  if (crimeCount < 10) return "⛔ Criminoso conhecido";
  return "☠️ PROCURADO VIVO OU MORTO";
}
