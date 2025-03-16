import { z } from 'zod'

export const signInSchema = {
  json: z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
  }),
}
