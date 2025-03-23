import { z } from 'zod'
import { SPACIOUSNESS, type Spaciousness, CLEANLINESS, type Cleanliness, RELAXATION, type Relaxation } from '../domain/report'

export const createReportSchema = {
  form: z.object({
    itemName: z.string().min(1, '商品名は必須です'),
    shopName: z.string().min(1, '店舗名は必須です'),
    location: z.string().min(1, '場所は必須です'),
    rating: z
      .string()
      .regex(/^[1-5](\.[05])?$/, '評価は1-5の0.5刻みで入力してください')
      .transform((val) => Number(val)),
    spaciousness: z
      .enum(['wide', 'narrow'])
      .transform((val) => {
        // 文字列からSpaciousness型の数値に変換
        return SPACIOUSNESS[val as keyof typeof SPACIOUSNESS]
      })
      .optional(),
    cleanliness: z
      .enum(['clean', 'dirty'])
      .transform((val) => {
        // 文字列からCleanliness型の数値に変換
        return CLEANLINESS[val as keyof typeof CLEANLINESS]
      })
      .optional(),
    relaxation: z
      .enum(['relaxed', 'busy'])
      .transform((val) => {
        // 文字列からRelaxation型の数値に変換
        return RELAXATION[val as keyof typeof RELAXATION]
      })
      .optional(),
    image: z.instanceof(File).optional(),
    comment: z.string().optional(),
    date: z.string().optional(),
  }),
}
