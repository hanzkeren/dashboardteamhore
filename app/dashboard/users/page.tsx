import { getUsers } from '@/features/users/actions'
import { UserForm } from '@/components/forms/user-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Edit } from 'lucide-react'

export default async function UsersPage() {
  const { data: users } = await getUsers()

  async function deleteUser(userId: string) {
    'use server'
    const { deleteUser } = await import('@/features/users/actions')
    await deleteUser(userId)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Daftar Users</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users?.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Bergabung: {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <div className="flex gap-2">
                    <form action={deleteUser.bind(null, user.id)}>
                      <Button type="submit" size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <UserForm />
        </div>
      </div>
    </div>
  )
}