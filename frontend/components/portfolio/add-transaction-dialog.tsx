"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Holding } from "@/types"

type AddTransactionDialogProps = {
  holdings: Holding[]
  portfolioId: string
}

export function AddTransactionDialog({
  holdings,
  portfolioId,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSubmitted(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Visual preview only. Will connect to POST /api/transactions.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-lg border border-[#00D084]/20 bg-[#00D084]/10 px-4 py-3 text-sm text-[#00D084]">
            Transaction queued (mock). Backend integration coming soon for portfolio{" "}
            <span className="font-mono text-xs">{portfolioId}</span>.
          </div>
        ) : (
          <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tx-asset" className="text-[#A1A1AA]">
                Asset
              </Label>
              <Select defaultValue={holdings[0]?.assetId}>
                <SelectTrigger
                  id="tx-asset"
                  className="border-white/10 bg-[#111] text-white"
                >
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111] text-white">
                  {holdings.map((h) => (
                    <SelectItem key={h.id} value={h.assetId}>
                      {h.asset.symbol} — {h.asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tx-type" className="text-[#A1A1AA]">
                  Type
                </Label>
                <Select defaultValue="BUY">
                  <SelectTrigger
                    id="tx-type"
                    className="border-white/10 bg-[#111] text-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111] text-white">
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-qty" className="text-[#A1A1AA]">
                  Quantity
                </Label>
                <Input
                  id="tx-qty"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  className="border-white/10 bg-[#111] font-mono text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-price" className="text-[#A1A1AA]">
                Price per unit (USD)
              </Label>
              <Input
                id="tx-price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                className="border-white/10 bg-[#111] font-mono text-white"
                required
              />
            </div>
          </form>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {submitted ? (
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="add-tx-form"
                className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
              >
                Save (mock)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
