import { Report, type Cleanliness, type Relaxation, type Spaciousness } from '../domain/report'
import type { ReportRepository } from '../infrastructure/repository/report-repository'

type CreateReportParams = {
  itemName: string
  shopName: string
  location: string
  rating: number
  spaciousness?: Spaciousness
  cleanliness?: Cleanliness
  relaxation?: Relaxation
  imageUrl?: string
  comment?: string
  date?: Date
}

export class CreateReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(params: CreateReportParams): Promise<string> {
    const id = crypto.randomUUID()
    const report = Report.create(
      id,
      params.itemName,
      params.shopName,
      params.location,
      params.rating,
      params.spaciousness,
      params.cleanliness,
      params.relaxation,
      params.imageUrl,
      params.comment,
      params.date
    )

    await this.reportRepository.save(report)
    return id
  }
}
