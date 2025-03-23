import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { CreateReportUseCase } from './usecase/create-report'
import { ReportRepository } from './infrastructure/repository/report-repository'
import { createDrizzleD1 } from './infrastructure/db/client'
import { createReportSchema } from './schema/report'
import { signInSchema } from './schema/auth'
import { auth } from './middleware/auth'
import { GetReportsUseCase } from './usecase/get-reports'
import { DeleteReportUseCase } from './usecase/delete-report'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
  ALLOWED_EMAIL: string
  R2_DOMAIN: string
}

type Variables = {
  jwtPayload: {
    email: string
  }
}

// 認証が不要なエンドポイントをグループ化
const commonRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .post('/signIn', zValidator('json', signInSchema.json), async (c) => {
    const { email } = c.req.valid('json')

    if (email !== c.env.ALLOWED_EMAIL) {
      return c.json({ message: 'Unauthorized email' }, 401)
    }

    const token = await sign({ email, sub: 'admin' }, c.env.JWT_SECRET)
    return c.json({ token })
  })
  .get('/getReports', async (c) => {
    const db = createDrizzleD1(c.env.DB)
    const repository = new ReportRepository(db)
    const useCase = new GetReportsUseCase(repository)
    const reports = await useCase.execute()
    return c.json(
      reports.map((r) => ({
        id: r.getId(),
        itemName: r.getItemName(),
        shopName: r.getShopName(),
        location: r.getLocation(),
        rating: r.getRating(),
        spaciousness: r.getSpaciousness(),
        cleanliness: r.getCleanliness(),
        relaxation: r.getRelaxation(),
        imageUrl: r.getImageUrl(),
        comment: r.getComment(),
        date: r.getDate()?.toISOString().split('T')[0].replace(/-/g, ''),
      }))
    )
  })

// 認証が必要なエンドポイントをグループ化
const authRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .post(
    '/createReport',
    zValidator('form', createReportSchema.form),
    async (c) => {
      const {
        itemName,
        shopName,
        location,
        rating,
        spaciousness,
        cleanliness,
        relaxation,
        image,
        comment,
        date,
      } = c.req.valid('form')
      const payload = c.get('jwtPayload')

      // 許可されたメールアドレス以外からのリクエストを拒否
      if (payload.email !== c.env.ALLOWED_EMAIL) {
        return c.json({ message: 'Unauthorized' }, 403)
      }

      let imageUrl: string | undefined
      if (image && image.size > 0) {
        const key = `${Date.now()}-${image.name}`
        await c.env.BUCKET.put(key, image)
        imageUrl = `${c.env.R2_DOMAIN}${key}`
      }

      const db = createDrizzleD1(c.env.DB)
      const repository = new ReportRepository(db)
      const useCase = new CreateReportUseCase(repository)

      const reportId = await useCase.execute({
        itemName,
        shopName,
        location,
        rating,
        spaciousness,
        cleanliness,
        relaxation,
        imageUrl,
        comment,
        date: date ? new Date(date) : undefined,
      })

      return c.json({ id: reportId }, 201)
    }
  )
  .delete('/deleteReport/:id', async (c) => {
    const id = c.req.param('id')
    const user = c.get('jwtPayload')

    // 許可されたメールアドレス以外からのリクエストを拒否
    if (user.email !== c.env.ALLOWED_EMAIL) {
      return c.json({ message: 'Unauthorized' }, 403)
    }

    const db = createDrizzleD1(c.env.DB)
    const repository = new ReportRepository(db)

    // 削除前にレポート情報を取得
    const report = await repository.findById(id)
    if (!report) {
      return c.json({ message: 'Report not found' }, 404)
    }

    // 画像URLがある場合、R2から画像を削除
    const imageUrl = report.getImageUrl()
    if (imageUrl) {
      try {
        // URLからキー名を抽出
        const key = imageUrl.split('/').pop()
        if (key) {
          await c.env.BUCKET.delete(key)
          console.log(`画像を削除しました: ${key}`)
        }
      } catch (error) {
        console.error('画像削除エラー:', error)
        // 画像削除に失敗してもレポート自体は削除を続行
      }
    }

    const useCase = new DeleteReportUseCase(repository)
    const success = await useCase.execute(id)

    if (!success) {
      return c.json({ message: 'Report not found' }, 404)
    }

    return c.json({ message: 'Report deleted successfully' })
  })

const app = new Hono()
  .use('*', cors())
  .use('/auth/*', auth)
  .route('/', commonRoute)
  .route('/auth', authRoute)

export type HonoType = typeof app

export default app
