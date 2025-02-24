import { Report } from "../domain/report";
import { ReportRepository } from "../infrastructure/repository/report-repository";

export interface CreateReportCommand {
  itemName: string;
  shopName: string;
  rating: number;
}

export class CreateReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: CreateReportCommand): Promise<string> {
    const report = new Report(command.itemName, command.shopName, command.rating);
    await this.reportRepository.save(report);
    return report.getId();
  }
} 