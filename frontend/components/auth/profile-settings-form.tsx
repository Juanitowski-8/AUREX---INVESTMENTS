'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IS_MOCK_MODE } from '@/lib/config'
import { getAuthFormErrorMessage } from '@/lib/auth/errors'
import { updateProfile } from '@/services/auth.service'
import type { User } from '@/types'

type ProfileSettingsFormProps = {
  initialUser: User
  onSaved: (user: User) => void
}

export function ProfileSettingsForm({
  initialUser,
  onSaved,
}: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(initialUser.name)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFullName(initialUser.name)
  }, [initialUser.name, initialUser.id])

  const handleSave = async () => {
    const trimmed = fullName.trim()
    if (!trimmed) {
      setError('Full name is required.')
      setMessage(null)
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const updated = await updateProfile({ fullName: trimmed })
      onSaved(updated)
      setMessage(
        IS_MOCK_MODE
          ? 'Profile saved locally (mock mode).'
          : 'Profile updated successfully.'
      )
    } catch (err) {
      setError(getAuthFormErrorMessage(err, 'Could not save profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-3 text-sm text-[#5DD879]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-3 text-sm text-[#FF6B6B]"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="profile-full-name" className="text-sm text-[#A1A1AA]">
          Full Name
        </label>
        <Input
          id="profile-full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-[#111] border-white/10 text-white"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="profile-email" className="text-sm text-[#A1A1AA]">
          Email Address
        </label>
        <Input
          id="profile-email"
          value={initialUser.email}
          type="email"
          disabled
          className="bg-[#111] border-white/10 text-[#71717A]"
        />
        <p className="text-xs text-[#52525B]">
          Email cannot be changed here. Use a new account if you need a different
          email.
        </p>
      </div>
      <Button
        type="button"
        disabled={saving}
        onClick={() => void handleSave()}
        className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-[#0A0A0A]"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  )
}
