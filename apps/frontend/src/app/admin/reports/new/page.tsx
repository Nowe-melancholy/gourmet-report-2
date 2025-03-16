import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { hc } from 'hono/client'
import type { HonoType } from '@repo/backend'
import ImageUploadPreview from '@/components/ImageUploadPreview'

export const metadata: Metadata = {
  title: '新規グルメレポート作成',
  description: '新規グルメレポート作成',
}

export default async function NewReportPage() {
  const session = await auth()

  // 管理者でない場合はトップページにリダイレクト
  if (!session?.user?.isAdmin) {
    redirect('/')
  }

  async function createReport(formData: FormData) {
    'use server'

    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      console.error('認証エラー: トークンがありません')
      redirect('/')
    }

    try {
      // FormDataからオブジェクトに変換
      const itemName = formData.get('itemName') as string
      const shopName = formData.get('shopName') as string
      const location = formData.get('location') as string
      const rating = formData.get('rating') as string
      const date = formData.get('date') as string
      const comment = formData.get('comment') as string
      const image = formData.get('image') as File

      // Hono Clientを使用
      const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL || '')

      const response = await client.auth.createReport.$post(
        {
          form: {
            itemName,
            shopName,
            location,
            rating,
            image,
            ...(date ? { date } : {}),
            ...(comment ? { comment } : {}),
          },
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      if (!response.ok) {
        console.error('レポート作成エラー:', await response.text())
        return
      }

      redirect('/admin/reports')
    } catch (error) {
      console.error('レポート作成エラー:', error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">新規グルメレポート作成</h1>
        <Link href="/admin/reports">
          <Button variant="outline">一覧に戻る</Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <form action={createReport} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="shopName">店舗名 *</Label>
            <Input id="shopName" name="shopName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">商品名 *</Label>
            <Input id="itemName" name="itemName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所 *</Label>
            <Input id="location" name="location" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">評価 (1-5) *</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.5"
              required
              defaultValue="3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input id="date" name="date" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">画像</Label>
            <ImageUploadPreview />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">コメント</Label>
            <Textarea id="comment" name="comment" rows={5} />
          </div>

          <div className="flex justify-end">
            <Button type="submit">レポートを作成</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
