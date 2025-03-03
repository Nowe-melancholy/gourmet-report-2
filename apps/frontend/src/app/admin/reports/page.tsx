import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { hc } from 'hono/client'
import { HonoType } from '@repo/backend';
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: '管理者用グルメレポート一覧',
  description: '管理者用グルメレポート一覧',
}

async function getReports() {
  const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL!)
  const res = await client.getReports.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  return res.json()
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
              date: `${report.date?.slice(
                0,
                4,
              )}-${report.date?.slice(4, 6)}-${report.date?.slice(
                6,
                8,
              )}`,
            }}
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
    comment: string | undefined
    date: string
  }
}

const AdminReportCard = ({
  report: { id, shopName, itemName, imageUrl, rating, comment, date },
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
        {imageUrl ? <div className="aspect-video relative mb-4">
          <Image
            src={imageUrl}
            alt={itemName}
            fill
            className="object-cover rounded-md"
          />
        </div> : null}
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
          <form action={async () => {
            'use server'
            // 削除処理を実装
            // const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL!)
            // await client.deleteReport.$post({ id })
          }}>
            <Button size="sm" variant="destructive">
              <Trash className="h-4 w-4 mr-1" />
              削除
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  )
} 