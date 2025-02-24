import { Report } from "../domain/report";
import { ReportRepository } from "../infrastructure/repository/report-repository";

export interface CreateReportCommand {
  itemName: string;
  shopName: string;
  location: string;
  rating: number;
}

export class CreateReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: CreateReportCommand): Promise<string> {
    const report = Report.create(
      command.itemName,
      command.shopName,
      command.location,
      command.rating
    );
    await this.reportRepository.save(report);
    return report.getId();
  }
} 