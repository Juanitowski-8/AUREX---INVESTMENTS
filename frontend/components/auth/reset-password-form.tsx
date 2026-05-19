'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getAuthFormErrorMessage } from '@/lib/auth/errors'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/schemas/reset-password.schema'
import { resetPassword } from '@/services/auth.service'

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null)
    try {
      await resetPassword(token, values.password)
      router.replace('/login?reset=success')
      router.refresh()
    } catch (error) {
      setFormError(
        getAuthFormErrorMessage(
          error,
          'Invalid or expired reset link. Request a new one.'
        )
      )
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[#FF6B6B]">
          Missing reset token. Use the link from forgot password.
        </p>
        <Button asChild className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]">
          <Link href="/forgot-password">Request reset link</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-3 text-sm text-[#FF6B6B]"
          >
            {formError}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#E4E4E7]">New password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="border-white/10 bg-[#111] pl-10 text-white placeholder:text-[#52525B] focus-visible:border-[#C9A227]/50 focus-visible:ring-[#C9A227]/20"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[#FF6B6B]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#E4E4E7]">Confirm password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="border-white/10 bg-[#111] pl-10 text-white placeholder:text-[#52525B] focus-visible:border-[#C9A227]/50 focus-visible:ring-[#C9A227]/20"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[#FF6B6B]" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Updating…
            </>
          ) : (
            'Update password'
          )}
        </Button>

        <p className="text-center text-sm text-[#A1A1AA]">
          <Link href="/login" className="text-[#C9A227] hover:text-[#E8C547]">
            ← Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
