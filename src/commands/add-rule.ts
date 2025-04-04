import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../@types/command";
import { environment } from "../config/environment";
import { RulesRepository } from "../repository/rules.repository";

export const addRule: Command<CommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName("add-rules")
    .setDescription("Adiciona uma nova regra ao servidor e a fixa")
    .addStringOption((option) =>
      option
        .setName("regra")
        .setDescription("O texto da regra a ser adicionada")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: CommandInteraction) {
    try {
      const ruleText = interaction.options.get("regra");

      if (!ruleText?.value) {
        await interaction.reply({
          content: "Erro: O texto da regra não foi especificado.",
          ephemeral: true,
        });
        return;
      }

      // Salvar a regra no repositório
      const ruleNumber = await RulesRepository.addRule(
        interaction.guildId as string,
        ruleText.value as string,
        interaction.user // Passando o objeto user completo
      );

      // Criar embed para a regra
      const ruleEmbed = createRuleEmbed(
        ruleNumber,
        ruleText.value as string,
        interaction.user.username
      );

      let messageUrl = "";
      
      const targetChannel = environment.ruleChannelId 
        ? (interaction.client.channels.cache.get(environment.ruleChannelId) as TextChannel)
        : (interaction.channel as TextChannel);
      
      if (targetChannel) {
        const message = await targetChannel.send({ embeds: [ruleEmbed] });
        await message.pin();
        
        messageUrl = `https://discord.com/channels/${interaction.guildId}/${targetChannel.id}/${message.id}`;
        
        await RulesRepository.updateRulePinInfo(
          interaction.guildId as string,
          ruleNumber,
          message.id,
          targetChannel.id,
          messageUrl
        );
        
        await interaction.reply({
          content: `Regra #${ruleNumber} adicionada e pinada com sucesso! [Ver regra](${messageUrl})`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Erro: Não foi possível encontrar o canal para enviar a regra.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content: "Ocorreu um erro ao adicionar a regra. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};

export const getRule: Command<CommandInteraction> = {
  data: new SlashCommandBuilder()
    .setName("regra")
    .setDescription("Mostra uma regra específica pelo número")
    .addIntegerOption((option) =>
      option
        .setName("numero_regra")
        .setDescription("O número da regra que deseja consultar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction: CommandInteraction) {
    try {
      const ruleNumber = interaction.options.get("numero_regra")?.value as number;

      if (!ruleNumber) {
        await interaction.reply({
          content: "Erro: Número da regra não especificado.",
          ephemeral: true,
        });
        return;
      }

      const rule = await RulesRepository.getRule(
        interaction.guildId as string,
        ruleNumber
      );

      if (!rule) {
        await interaction.reply({
          content: `Não existe uma regra com o número ${ruleNumber}.`,
          ephemeral: true,
        });
        return;
      }

      const ruleEmbed = new EmbedBuilder()
        .setColor("#0099FF")
        .setTitle(`📜 Regra #${rule.ruleNumber}`)
        .setDescription(rule.text)
        .addFields(
          {
            name: "Adicionada por",
            value: rule.addedByName,
            inline: true,
          },
          {
            name: "Data de criação",
            value: rule.createdAt.toLocaleDateString(),
            inline: true,
          }
        );

      if (rule.pinnedUrl) {
        ruleEmbed.addFields({
          name: "Link da regra",
          value: `[Clique aqui para ver a regra pinada](${rule.pinnedUrl})`,
        });
      }

      ruleEmbed.setFooter({ text: "Sistema de Regras do Servidor" }).setTimestamp();

      await interaction.reply({
        embeds: [ruleEmbed],
      });
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content: "Ocorreu um erro ao buscar a regra. Tente novamente mais tarde.",
        ephemeral: true,
      });
    }
  },
};

function createRuleEmbed(
  ruleNumber: number,
  ruleText: string,
  addedBy: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("#0099FF")
    .setTitle(`📜 Regra #${ruleNumber}`)
    .setDescription(ruleText)
    .addFields(
      {
        name: "Adicionada por",
        value: addedBy,
        inline: true,
      }
    )
    .setFooter({ text: "Sistema de Regras do Servidor" })
    .setTimestamp();
}