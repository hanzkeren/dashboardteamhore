import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fullstack Next.js App
          </h1>
          <p className="text-xl text-gray-600">
            Template dengan Next.js 15, Prisma, PostgreSQL, dan shadcn/ui
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Kelola data pengguna dengan CRUD lengkap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/users">
                <Button className="w-full">
                  Go to Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posts Management</CardTitle>
              <CardDescription>
                Kelola konten blog atau postingan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/posts">
                <Button className="w-full" variant="outline">
                  Go to Posts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                RESTful API endpoints untuk integrasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>GET /api/users - List all users</p>
                <p>POST /api/users - Create user</p>
                <p>GET /api/posts - List all posts</p>
                <p>POST /api/posts - Create post</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Teknologi yang digunakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-600">
                <p>✅ Next.js 15 App Router</p>
                <p>✅ Prisma ORM</p>
                <p>✅ PostgreSQL</p>
                <p>✅ TypeScript</p>
                <p>✅ TailwindCSS</p>
                <p>✅ shadcn/ui</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}