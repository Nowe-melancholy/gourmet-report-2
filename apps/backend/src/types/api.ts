import type { z } from 'zod'
import type { createReportSchema } from '../schema/report'

export type CreateReportForm = z.infer<typeof createReportSchema.form>

export type CreateReportResponse = {
  id: string
}
