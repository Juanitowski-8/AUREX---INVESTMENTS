"use client"

import { Check, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CURRENCY_OPTIONS,
  useCurrency,
  type DisplayCurrency,
} from "@/lib/currency"
import { cn } from "@/lib/utils"

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()
  const current = CURRENCY_OPTIONS.find((o) => o.code === currency)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 border border-white/10 bg-[#111]/80 px-2 text-[#A1A1AA] hover:border-[#C9A227]/30 hover:bg-[#C9A227]/10 hover:text-[#C9A227] sm:px-3",
            className
          )}
          aria-label="Change display currency"
        >
          <Coins className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-xs font-semibold sm:text-sm">
            {current?.short ?? currency}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[10rem] border-white/10 bg-[#111] text-white"
      >
        {CURRENCY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            className="cursor-pointer focus:bg-white/5 focus:text-white"
            onSelect={() => setCurrency(option.code as DisplayCurrency)}
          >
            <span className="flex flex-1 items-center justify-between gap-3">
              <span>{option.label}</span>
              {currency === option.code ? (
                <Check className="h-4 w-4 text-[#C9A227]" aria-hidden />
              ) : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
