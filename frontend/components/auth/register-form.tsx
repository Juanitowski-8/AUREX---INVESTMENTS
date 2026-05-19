'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail, User } from 'lucide-react'
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
import { getRegisterErrorMessage } from '@/lib/auth/errors'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/schemas/register.schema'
import { register } from '@/services/auth.service'

export function RegisterForm() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null)
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      setFormError(getRegisterErrorMessage(error))
    }
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#E4E4E7]">Full name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <Input
                    {...field}
                    autoComplete="name"
                    placeholder="Jane Doe"
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#E4E4E7]">Password</FormLabel>
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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-center text-sm text-[#A1A1AA]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C9A227] hover:text-[#E8C547]">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
