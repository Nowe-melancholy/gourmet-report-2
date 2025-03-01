import { ReportRepository } from '../infrastructure/repository/report-repository';
import { Report } from '../domain/report';

export class GetReportsUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<Report[]> {
    return this.reportRepository.findAll();
  }
} 