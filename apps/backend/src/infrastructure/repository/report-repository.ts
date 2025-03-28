import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from '../db/client'
import { reports } from '../db/schema'
import { Report, SPACIOUSNESS, type Spaciousness, CLEANLINESS, type Cleanliness, RELAXATION, type Relaxation } from '../../domain/report'

export class ReportRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  // 型ガード関数
  private isValidSpaciousness(value: number | null): value is Spaciousness {
    if (value === null) return false
    return value === SPACIOUSNESS.wide || value === SPACIOUSNESS.narrow
  }

  private isValidCleanliness(value: number | null): value is Cleanliness {
    if (value === null) return false
    return value === CLEANLINESS.clean || value === CLEANLINESS.dirty
  }

  private isValidRelaxation(value: number | null): value is Relaxation {
    if (value === null) return false
    return value === RELAXATION.relaxed || value === RELAXATION.busy
  }

  async save(report: Report): Promise<void> {
    await this.db.insert(reports).values({
      id: report.getId(),
      itemName: report.getItemName(),
      shopName: report.getShopName(),
      location: report.getLocation(),
      rating: report.getRating(),
      spaciousness: report.getSpaciousness(),
      cleanliness: report.getCleanliness(),
      relaxation: report.getRelaxation(),
      imageUrl: report.getImageUrl(),
      comment: report.getComment(),
      date: report.getDate()?.toISOString(),
    })
  }

  async findById(id: string): Promise<Report | null> {
    const result = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .get()

    if (!result) {
      return null
    }

    const spaciousness = result.spaciousness
    const cleanliness = result.cleanliness
    const relaxation = result.relaxation

    return Report.create(
      result.id,
      result.itemName,
      result.shopName,
      result.location,
      result.rating,
      this.isValidSpaciousness(spaciousness) ? spaciousness : undefined,
      this.isValidCleanliness(cleanliness) ? cleanliness : undefined,
      this.isValidRelaxation(relaxation) ? relaxation : undefined,
      result.imageUrl ?? undefined,
      result.comment ?? undefined,
      result.date ? new Date(result.date) : undefined
    )
  }

  async findAll(): Promise<Report[]> {
    const results = await this.db.select().from(reports).all()
    return results.map((result) => {
      const spaciousness = result.spaciousness
      const cleanliness = result.cleanliness
      const relaxation = result.relaxation

      return Report.create(
        result.id,
        result.itemName,
        result.shopName,
        result.location,
        result.rating,
        this.isValidSpaciousness(spaciousness) ? spaciousness : undefined,
        this.isValidCleanliness(cleanliness) ? cleanliness : undefined,
        this.isValidRelaxation(relaxation) ? relaxation : undefined,
        result.imageUrl ?? undefined,
        result.comment ?? undefined,
        result.date ? new Date(result.date) : undefined
      )
    })
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(reports).where(eq(reports.id, id)).run()
    return result.success
  }
}
