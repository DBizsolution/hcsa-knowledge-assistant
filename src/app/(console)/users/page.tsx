import type { Metadata } from 'next'
import { UserPlus, Users, ShieldCheck, UserCog } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLE_SUMMARY, USERS } from '@/data/mock'

export const metadata: Metadata = { title: 'User management' }

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-teal-50 text-teal-800',
  invited: 'bg-[color-mix(in_oklch,var(--link-blue),white_85%)] text-link-blue',
  suspended: 'bg-[color-mix(in_oklch,var(--hdb-red),white_88%)] text-hdb-red',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

export default function UsersPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        title="User management"
        description="Manage officers, roles and access to the knowledge assistant."
        mock
        actions={
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover">
            <UserPlus className="size-4" />
            Invite user
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value="39" icon={Users} hint="across 4 departments" />
        <StatCard label="Administrators" value="2" icon={ShieldCheck} hint="full access" />
        <StatCard label="Active today" value="27" icon={UserCog} hint="last 24 hours" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ROLE_SUMMARY.map((role) => (
              <div key={role.role} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-700">{role.role}</span>
                  <Badge variant="secondary" className="bg-muted text-ink-600">
                    {role.count}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">{role.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-teal-800 text-xs text-white">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="block truncate font-medium text-ink-700">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-ink-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-ink-600">{user.role}</TableCell>
                    <TableCell className="text-ink-600">{user.department}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_BADGE[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-ink-500">{user.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
