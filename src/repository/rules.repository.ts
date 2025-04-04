import { User } from "discord.js";
import { prisma } from "../config/database";


export class RulesRepository {
  static async addRule(
    guildId: string,
    text: string,
    user: User
  ): Promise<number> {
    const highestRule = await prisma.rule.findFirst({
      where: { guildId },
      orderBy: { ruleNumber: "desc" },
    });

    const nextRuleNumber = highestRule ? highestRule.ruleNumber + 1 : 1;

    const rule = await prisma.rule.create({
      data: {
        guildId,
        ruleNumber: nextRuleNumber,
        text,
        addedBy: user.id,
        addedByName: user.username,
      },
    });

    return rule.ruleNumber;
  }
  static async updateRulePinInfo(
    guildId: string,
    ruleNumber: number,
    messageId: string,
    channelId: string,
    pinnedUrl: string
  ): Promise<void> {
    await prisma.rule.update({
      where: {
        guildId_ruleNumber: {
          guildId,
          ruleNumber,
        },
      },
      data: {
        messageId,
        channelId,
        pinnedUrl,
      },
    });
  }
  static async getRule(guildId: string, ruleNumber: number) {
    return prisma.rule.findUnique({
      where: {
        guildId_ruleNumber: {
          guildId,
          ruleNumber,
        },
      },
    });
  }
  static async listRules(guildId: string) {
    return prisma.rule.findMany({
      where: { guildId },
      orderBy: { ruleNumber: "asc" },
    });
  }
}