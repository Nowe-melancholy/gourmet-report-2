import type { ReportRepository } from '../infrastructure/repository/report-repository'

export class DeleteReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.reportRepository.delete(id)
  }
}
