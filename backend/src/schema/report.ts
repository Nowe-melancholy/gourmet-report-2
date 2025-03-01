import { z } from 'zod';

export const createReportSchema = {
  form: z.object({
    itemName: z.string().min(1, '商品名は必須です'),
    shopName: z.string().min(1, '店舗名は必須です'),
    location: z.string().min(1, '場所は必須です'),
    rating: z
      .string()
      .regex(/^[1-5](\.[05])?$/, '評価は1-5の0.5刻みで入力してください')
      .transform((val) => Number(val)),
    image: z.instanceof(File).optional(),
    comment: z.string().optional(),
    date: z.string().optional(),
  }),
};
