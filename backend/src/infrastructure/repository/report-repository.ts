import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "../db/client";
import { reports } from "../db/schema";
import { Report } from "../../domain/report";

export class ReportRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async save(report: Report): Promise<void> {
    await this.db.insert(reports).values({
      id: report.getId(),
      itemName: report.getItemName(),
      shopName: report.getShopName(),
      location: report.getLocation(),
      rating: report.getRating(),
    });
  }

  async findById(id: string): Promise<Report | null> {
    const result = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .get();

    if (!result) {
      return null;
    }

    return Report.reconstruct(
      result.id,
      result.itemName,
      result.shopName,
      result.location,
      result.rating
    );
  }

  async findAll(): Promise<Report[]> {
    const results = await this.db.select().from(reports).all();
    return results.map((result) =>
      Report.reconstruct(
        result.id,
        result.itemName,
        result.shopName,
        result.location,
        result.rating
      )
    );
  }
} 