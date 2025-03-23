import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { hc } from 'hono/client'
import type { HonoType } from '@repo/backend'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// 広さの定数（バックエンドと同じ値を使用）
export const SPACIOUSNESS = {
  wide: 1,
  narrow: 2,
} as const

export type Spaciousness = typeof SPACIOUSNESS[keyof typeof SPACIOUSNESS]

// 綺麗さの定数（バックエンドと同じ値を使用）
export const CLEANLINESS = {
  clean: 1,
  dirty: 2,
} as const

export type Cleanliness = typeof CLEANLINESS[keyof typeof CLEANLINESS]

// ゆっくり度の定数（バックエンドと同じ値を使用）
export const RELAXATION = {
  relaxed: 1,
  busy: 2,
} as const

export type Relaxation = typeof RELAXATION[keyof typeof RELAXATION]

export const metadata: Metadata = {
  title: '管理者用グルメレポート一覧',
  description: '管理者用グルメレポート一覧',
}

async function getReports() {
  const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL || '')
  const res = await client.getReports.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  return res.json()
}

async function deleteReport(formData: FormData) {
  'use server'

  const id = formData.get('id') as string

  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      console.error('認証エラー: トークンがありません')
      return
    }

    // Hono Clientを使用
    const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL || '')

    // 動的パスパラメータを含むエンドポイントに対してリクエスト
    const response = await client.auth.deleteReport[':id'].$delete(
      { param: { id } },
      { headers: { Authorization: `Bearer ${authToken}` } }
    )

    if (!response.ok) {
      console.error('削除エラー:', await response.text())
      return
    }

    revalidatePath('/')
    revalidatePath('/admin/reports')
  } catch (error) {
    console.error('削除エラー:', error)
  }
}

export default async function AdminReportsPage() {
  const session = await auth()

  // 管理者でない場合はトップページにリダイレクト
  if (!session?.user?.isAdmin) {
    redirect('/')
  }

  const data = await getReports()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理者用グルメレポート一覧</h1>
        <div className="flex gap-4">
          <Link href="/admin/reports/new">
            <Button>新規レポート作成</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">トップページへ戻る</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((report) => (
          <AdminReportCard
            key={report.id}
            report={{
              ...report,
              date: `${report.date?.slice(0, 4)}-${report.date?.slice(4, 6)}-${report.date?.slice(
                6,
                8
              )}`,
            }}
            id={report.id}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-2">
        <Link href="/admin/reports?page=1">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            前へ
          </Button>
        </Link>
        <Link href={`/admin/reports?page=${1}`}>
          <Button variant="outline">
            次へ
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

type AdminReportCardProps = {
  report: {
    id: string
    shopName: string
    itemName: string
    imageUrl: string | undefined
    rating: number
    spaciousness: number | undefined
    cleanliness: number | undefined
    relaxation: number | undefined
    comment: string | undefined
    date: string
  }
  id: string
}

const AdminReportCard = ({
  report: {
    id,
    shopName,
    itemName,
    imageUrl,
    rating,
    spaciousness,
    cleanliness,
    relaxation,
    comment,
    date,
  },
}: AdminReportCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{`${shopName} ${itemName}`}</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary" />
            {rating}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {imageUrl ? (
          <div className="aspect-video relative mb-4">
            <Image src={imageUrl} alt={itemName} fill className="object-cover rounded-md" />
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {spaciousness && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">広さ</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {spaciousness === SPACIOUSNESS.wide ? '広い' : '狭い'}
              </Badge>
            </div>
          )}
          {cleanliness && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">綺麗さ</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {cleanliness === CLEANLINESS.clean ? '綺麗' : '汚い'}
              </Badge>
            </div>
          )}
          {relaxation && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">ゆっくり度</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {relaxation === RELAXATION.relaxed ? 'ゆっくりできる' : '忙しい'}
              </Badge>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{comment}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">{date}</p>
        <div className="flex gap-2">
          <Link href={`/admin/reports/${id}/edit`}>
            <Button size="sm" variant="outline">
              <Pencil className="h-4 w-4 mr-1" />
              編集
            </Button>
          </Link>
          <form action={deleteReport}>
            <input type="hidden" name="id" value={id} />
            <Button size="sm" variant="destructive" type="submit">
              <Trash className="h-4 w-4 mr-1" />
              削除
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  )
}
