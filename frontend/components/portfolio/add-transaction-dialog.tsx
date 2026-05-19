"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus } from "lucide-react"
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
import { getMarketAssets } from "@/services/market.service"
import { createTransaction } from "@/services/portfolio.service"
import type { MarketAsset } from "@/types"

type AddTransactionDialogProps = {
  portfolioId: string
  onSuccess?: () => void | Promise<void>
}

export function AddTransactionDialog({
  portfolioId,
  onSuccess,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [assets, setAssets] = useState<MarketAsset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetSymbol, setAssetSymbol] = useState("")
  const [type, setType] = useState<"BUY" | "SELL">("BUY")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [transactionDate, setTransactionDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setAssetsLoading(true)
    getMarketAssets()
      .then((list) => {
        setAssets(list)
        if (list[0]) setAssetSymbol((prev) => prev || list[0]!.symbol)
      })
      .catch(() => setError("Could not load assets"))
      .finally(() => setAssetsLoading(false))
  }, [open])

  useEffect(() => {
    if (open && !transactionDate) {
      const now = new Date()
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      setTransactionDate(local.toISOString().slice(0, 16))
    }
  }, [open, transactionDate])

  const resetForm = () => {
    setQuantity("")
    setPrice("")
    setNotes("")
    setError(null)
    setType("BUY")
    setAssetSymbol("")
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseFloat(quantity)
    const px = parseFloat(price)
    if (!assetSymbol || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(px) || px <= 0) {
      setError("Enter a valid asset, quantity, and price.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const dateIso = transactionDate
        ? new Date(transactionDate).toISOString()
        : new Date().toISOString()

      await createTransaction({
        portfolioId,
        assetId: assetSymbol,
        type,
        quantity: qty,
        price: px,
        transactionDate: dateIso,
        notes: notes.trim() || undefined,
      })
      setOpen(false)
      resetForm()
      await onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Simulated buy or sell — saved to your portfolio on the server.
          </DialogDescription>
        </DialogHeader>

        <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx-asset" className="text-[#A1A1AA]">Asset</Label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol} disabled={assetsLoading || assets.length === 0}>
              <SelectTrigger id="tx-asset" className="border-white/10 bg-[#111] text-white">
                <SelectValue placeholder={assetsLoading ? "Loading…" : "Select asset"} />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                {assets.map((a) => (
                  <SelectItem key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-type" className="text-[#A1A1AA]">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "BUY" | "SELL")}>
              <SelectTrigger id="tx-type" className="border-white/10 bg-[#111] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-qty" className="text-[#A1A1AA]">Quantity</Label>
              <Input id="tx-qty" type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border-white/10 bg-[#111] font-mono text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-price" className="text-[#A1A1AA]">Price (USD)</Label>
              <Input id="tx-price" type="number" step="any" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="border-white/10 bg-[#111] font-mono text-white" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-date" className="text-[#A1A1AA]">Date & time</Label>
            <Input id="tx-date" type="datetime-local" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="border-white/10 bg-[#111] text-white" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-notes" className="text-[#A1A1AA]">Notes (optional)</Label>
            <Input id="tx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Educational note…" className="border-white/10 bg-[#111] text-white" />
          </div>
          {error && (
            <p className="text-sm text-[#FF3B30]" role="alert">
              {error}
            </p>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-tx-form"
            disabled={loading || assetsLoading}
            className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save transaction"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
