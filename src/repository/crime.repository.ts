import { User } from "discord.js";
import { prisma } from "../config/database";

export class CrimeRepository {
  static async createCrime(reporter: User, criminal: User, reason: string) {
    try {
      await Promise.all([
         this.findOrCreateUser(reporter),
         this.findOrCreateUser(criminal)
      ])

      const crime = await prisma.crime.create({
        data: {
          reporterId: reporter.id,
          criminalId: criminal.id,
          reason
        }
      });

      await prisma.user.update({
        where: { id: criminal.id },
        data: { crimeCount: { increment: 1 } }
      });

      return crime;
    } catch (error) {
      console.error('Erro ao registrar crime:', error);
      throw error;
    }
  }

  static async findOrCreateUser(user: User) {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          username: user.username
        }
      });
    }
  }

  static async getCrimeCount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    return user?.crimeCount || 0;
  }

  static async getUserCrimes(userId: string) {
    return prisma.crime.findMany({
      where: { criminalId: userId },
      include: { reporter: true }
    });
  }

  static async getUserReports(userId: string) {
    return prisma.crime.findMany({
      where: { reporterId: userId },
      include: { criminal: true }
    });
  }
}