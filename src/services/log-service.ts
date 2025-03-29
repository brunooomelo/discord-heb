export class LogService {
  static async log(reporterId: string, criminalId: any, reason: any) {
    console.log(`[CRIME LOG] Reporter: ${reporterId} | Criminal: ${criminalId} | Reason: ${reason}`);
  }
}