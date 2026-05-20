"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IS_MOCK_MODE } from "@/lib/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createAlertSchema,
  type CreateAlertFormValues,
} from "@/lib/schemas/create-alert.schema"
import type { MarketAsset } from "@/types"
import type { CreateAlertInput } from "@/types/api"

type CreateAlertModalProps = {
  assets: MarketAsset[]
  onCreate: (input: CreateAlertInput) => Promise<void>
}

export function CreateAlertModal({ assets, onCreate }: CreateAlertModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CreateAlertFormValues>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      assetId: "",
      condition: "PRICE_ABOVE",
      targetPrice: undefined,
    },
  })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      form.reset({
        assetId: "",
        condition: "PRICE_ABOVE",
        targetPrice: undefined,
      })
    }
  }

  const onSubmit = async (values: CreateAlertFormValues) => {
    setSubmitting(true)
    try {
      await onCreate({
        assetId: values.assetId,
        type: values.condition,
        targetValue: values.targetPrice,
        status: "Active",
      })
      handleOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Create alert
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create price alert</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {IS_MOCK_MODE
              ? "Simulated alert — fires against mock market prices."
              : "Saved to your account. You will be notified when the asset crosses your target."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#A1A1AA]">Asset</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-white/10 bg-[#111] text-white">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-white/10 bg-[#111] text-white">
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="ml-2 text-[#71717A]">
                            {asset.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#A1A1AA]">Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-white/10 bg-[#111] text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-white/10 bg-[#111] text-white">
                      <SelectItem value="PRICE_ABOVE">
                        <span className="flex items-center gap-2">
                          <TrendingUp
                            className="h-4 w-4 text-[#00D084]"
                            aria-hidden
                          />
                          Above target price
                        </span>
                      </SelectItem>
                      <SelectItem value="PRICE_BELOW">
                        <span className="flex items-center gap-2">
                          <TrendingDown
                            className="h-4 w-4 text-[#FF3B30]"
                            aria-hidden
                          />
                          Below target price
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#A1A1AA]">
                    Target price (USD)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="50000"
                      className="border-white/10 bg-[#111] font-mono text-white"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
              >
                {submitting ? "Creating…" : "Create alert"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
