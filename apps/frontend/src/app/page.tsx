import type { Metadata } from 'next'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { hc } from 'hono/client'
import type { HonoType } from '@repo/backend'
import { auth, signIn, signOut } from '@/auth'

export const metadata: Metadata = {
  title: 'グルメレポート一覧',
  description: 'グルメレポート一覧',
}

async function getReports() {
  const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL!)
  const res = await client.getReports.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  return res.json()
}

export default async function Page() {
  const data = await getReports()
  const session = await auth()
  const isAdmin = session?.user?.isAdmin

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-8">グルメレポート一覧</h1>
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <span>管理者: {session.user.email}</span>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <Button variant="outline">ログアウト</Button>
            </form>
            <Link href="/admin/reports">
              <Button>管理者ページへ</Button>
            </Link>
          </div>
        ) : (
          <form
            action={async () => {
              'use server'
              await signIn('google')
            }}
          >
            <Button>管理者ログイン</Button>
          </form>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((report) => (
          <ReportCard
            key={report.id}
            report={{
              ...report,
              date: `${report.date?.slice(0, 4)}-${report.date?.slice(4, 6)}-${report.date?.slice(
                6,
                8
              )}`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-center mt-8 gap-2">
        <Link href="/reports?page=1">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            前へ
          </Button>
        </Link>
        <Link href={`/reports?page=${1}`}>
          <Button variant="outline">
            次へ
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

type ReportCardProps = {
  report: {
    shopName: string
    itemName: string
    imageUrl: string | undefined
    rating: number
    comment: string | undefined
    date: string
  }
}

const ReportCard = ({
  report: { shopName, itemName, imageUrl, rating, comment, date },
}: ReportCardProps) => {
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
        <p className="text-sm text-muted-foreground">{comment}</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardFooter>
    </Card>
  )
}
