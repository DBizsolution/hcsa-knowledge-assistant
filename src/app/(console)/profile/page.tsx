'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const PREFERENCES = [
  { title: 'Email digest', desc: 'Weekly summary of your activity and new sources.', on: true },
  { title: 'Citation previews', desc: 'Expand source passages by default in answers.', on: true },
  { title: 'Show retrieval trace', desc: 'Display the search queries the assistant runs.', on: false },
]

const defaultPreferences = () =>
  Object.fromEntries(PREFERENCES.map((pref) => [pref.title, pref.on]))

export default function ProfilePage() {
  const [fullName, setFullName] = useState('Rajan Kumar')
  const [email, setEmail] = useState('rajan.kumar@hcsa.gov.pu')
  const [department, setDepartment] = useState('Health, Safety & Environment')
  const [jobTitle, setJobTitle] = useState('HSE Senior Officer')
  const [preferences, setPreferences] = useState<Record<string, boolean>>(defaultPreferences)

  const handleSave = () => {
    toast.success('Profile updated', { description: 'Your account details have been saved.' })
  }

  const handleChangePhoto = () => {
    toast('Photo upload is disabled in the prototype')
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Profile" description="Your account details and assistant preferences." mock />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                RK
              </AvatarFallback>
            </Avatar>
            <p className="mt-4 text-lg font-bold text-ink-700">Rajan Kumar</p>
            <p className="text-sm text-ink-500">rajan.kumar@hcsa.gov.pu</p>
            <Badge variant="secondary" className="mt-3 bg-teal-50 text-teal-800">
              Knowledge officer
            </Badge>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleChangePhoto}>
              Change photo
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input
                  id="dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button
                  className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
                  onClick={handleSave}
                >
                  <Save className="size-4" />
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {PREFERENCES.map((pref) => (
                <div key={pref.title} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink-700">{pref.title}</p>
                    <p className="text-sm text-ink-500">{pref.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[pref.title]}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, [pref.title]: checked }))
                    }
                    aria-label={pref.title}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
