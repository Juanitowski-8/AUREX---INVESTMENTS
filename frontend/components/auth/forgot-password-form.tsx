'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/schemas/forgot-password.schema'
import { forgotPassword } from '@/services/auth.service'

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    message: string
    resetHref: string | null
  } | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null)
    setSuccess(null)
    try {
      const result = await forgotPassword(values.email)
      const resetHref = result.resetToken
        ? `/reset-password?token=${encodeURIComponent(result.resetToken)}`
        : null
      setSuccess({ message: result.message, resetHref })
    } catch (error) {
      setFormError(
        getAuthFormErrorMessage(error, 'Could not start password reset.')
      )
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-3 text-sm text-[#5DD879]">
          {success.message}
        </div>
        {success.resetHref ? (
          <Button
            asChild
            className="h-11 w-full bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
          >
            <Link href={success.resetHref}>Reset your password</Link>
          </Button>
        ) : (
          <p className="text-center text-sm text-[#A1A1AA]">
            If this email is registered, check your inbox. Otherwise try another
            email or create an account.
          </p>
        )}
        <p className="text-center text-sm text-[#A1A1AA]">
          <Link href="/login" className="text-[#C9A227] hover:text-[#E8C547]">
            ← Back to sign in
          </Link>
        </p>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#E4E4E7]">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
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
              Sending…
            </>
          ) : (
            'Send reset link'
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
