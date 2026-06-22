'use client'

import { useMemo, useState } from 'react'
import { UserPlus, Users, ShieldCheck, UserCog, Search, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shell/page'
import { StatCard } from '@/components/shell/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLE_SUMMARY, USERS, type AppUser } from '@/data/mock'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-[color-mix(in_oklch,var(--success),var(--background)_88%)] text-success',
  invited: 'bg-[color-mix(in_oklch,var(--info),var(--background)_88%)] text-info',
  suspended: 'bg-[color-mix(in_oklch,var(--destructive),var(--background)_88%)] text-destructive',
}

const ROLES: AppUser['role'][] = ['Administrator', 'Knowledge officer', 'Analyst', 'Viewer']

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(USERS)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AppUser['role']>('Viewer')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!term) return true
      return [user.name, user.email, user.department, user.role]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [users, query, roleFilter])

  const submitInvite = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setUsers((prev) => [
      {
        name: name.trim(),
        email: email.trim(),
        role,
        department: '–',
        status: 'invited',
        lastActive: '–',
      },
      ...prev,
    ])
    toast.success('Invitation sent', { description: `${name.trim()} · ${role}` })
    setName('')
    setEmail('')
    setRole('Viewer')
    setInviteOpen(false)
  }

  const toggleStatus = (target: AppUser) => {
    const next = target.status === 'suspended' ? 'active' : 'suspended'
    setUsers((prev) =>
      prev.map((user) => (user.email === target.email ? { ...user, status: next } : user)),
    )
    toast.success(next === 'suspended' ? 'User suspended' : 'User activated', {
      description: target.name,
    })
  }

  return (
    <>
      <PageHeader
        title="User management"
        description="Manage officers, roles and access to the knowledge assistant."
        mock
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover" />
              }
            >
              <UserPlus className="size-4" />
              Invite user
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite user</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new officer. They will appear as invited until they
                  accept.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hcsa.gov.pu"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => setRole(value as AppUser['role'])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter showCloseButton>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-hdb-red-hover"
                  onClick={submitInvite}
                >
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            {ROLE_SUMMARY.map((roleItem) => (
              <div key={roleItem.role} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-700">{roleItem.role}</span>
                  <Badge variant="secondary" className="bg-muted text-ink-600">
                    {roleItem.count}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">{roleItem.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="gap-3">
            <CardTitle>Users</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-500" />
                <Input
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, department…"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value ?? 'all')}
              >
                <SelectTrigger className="sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-ink-500">
                      No users match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleStatus(user)}>
                              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
