'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sun, Moon, Monitor } from 'lucide-react'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Settings</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Appearance</CardTitle>
            <CardDescription>Choose how FinanceKite looks for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => {
                const isActive = theme === value
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
