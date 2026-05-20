"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
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
import { IS_MOCK_MODE } from "@/lib/config"
import { formatUnitPrice, parsePositiveDecimal } from "@/lib/number-parse"
import { evaluateMockAlerts } from "@/lib/mock-alert-engine"
import { refreshLiveMarketCache } from "@/lib/live-market-cache"
import { dispatchPortfolioUpdated } from "@/lib/portfolio-events"
import { formatCurrency } from "@/lib/mock-data"
import { getMarketAssetBySymbol, getMarketAssets } from "@/services/market.service"
import { refreshAnalysisAfterTransaction } from "@/services/portfolio-analysis-on-change"
import {
  createTransaction,
  getPortfolioHoldings,
} from "@/services/portfolio.service"
import { formatQuantity } from "@/lib/number-parse"
import type { Holding, MarketAsset } from "@/types"

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
  const [unitPrice, setUnitPrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [transactionDate, setTransactionDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadMarketPrice = async (symbol: string) => {
    if (!symbol) return
    setPriceLoading(true)
    try {
      const fromList = assets.find((a) => a.symbol === symbol)
      if (fromList?.price) {
        setUnitPrice(fromList.price)
        return
      }
      const asset = await getMarketAssetBySymbol(symbol)
      if (asset?.price) setUnitPrice(asset.price)
      else setError("No market price for this asset.")
    } catch {
      setError("Could not load market price.")
    } finally {
      setPriceLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    setAssetsLoading(true)
    Promise.all([
      getMarketAssets(),
      getPortfolioHoldings(portfolioId, { reload: true }),
    ])
      .then(([list, held]) => {
        setAssets(list)
        setHoldings(held)
        const first =
          type === "SELL"
            ? held[0]?.asset.symbol ?? ""
            : list[0]?.symbol ?? ""
        setAssetSymbol((prev) => {
          if (prev && list.some((a) => a.symbol === prev)) return prev
          if (type === "SELL" && held.some((h) => h.asset.symbol === prev)) {
            return prev
          }
          return first
        })
      })
      .catch(() => setError("Could not load assets"))
      .finally(() => setAssetsLoading(false))
  }, [open, portfolioId, type])

  useEffect(() => {
    if (!open || !assetSymbol) return
    void loadMarketPrice(assetSymbol)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assetSymbol, assets])

  useEffect(() => {
    if (!open || type !== "SELL") return
    if (holdings.length === 0) {
      setAssetSymbol("")
      return
    }
    if (!holdings.some((h) => h.asset.symbol === assetSymbol)) {
      setAssetSymbol(holdings[0]!.asset.symbol)
    }
  }, [type, holdings, assetSymbol, open])

  useEffect(() => {
    if (open && !transactionDate) {
      const now = new Date()
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      setTransactionDate(local.toISOString().slice(0, 16))
    }
  }, [open, transactionDate])

  const qty = useMemo(() => parsePositiveDecimal(quantity), [quantity])

  const selectableAssets = useMemo(() => {
    if (type !== "SELL") return assets
    const heldSymbols = new Set(holdings.map((h) => h.asset.symbol))
    return assets.filter((a) => heldSymbols.has(a.symbol))
  }, [type, assets, holdings])

  const availableToSell = useMemo(() => {
    if (type !== "SELL" || !assetSymbol) return null
    return (
      holdings.find((h) => h.asset.symbol === assetSymbol)?.quantity ?? 0
    )
  }, [type, assetSymbol, holdings])

  const estimatedTotal = useMemo(() => {
    if (qty == null || unitPrice == null) return null
    return qty * unitPrice
  }, [qty, unitPrice])

  const resetForm = () => {
    setQuantity("")
    setUnitPrice(null)
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
    if (!assetSymbol || qty == null || unitPrice == null || unitPrice <= 0) {
      setError("Select an asset, enter a valid quantity, and wait for the market price.")
      return
    }

    if (
      type === "SELL" &&
      availableToSell != null &&
      qty > availableToSell + 1e-9
    ) {
      setError(
        `You only hold ${formatQuantity(availableToSell)} ${assetSymbol}. Reduce the sell quantity.`
      )
      return
    }

    if (type === "SELL" && availableToSell != null && availableToSell <= 0) {
      setError(`You do not hold any ${assetSymbol} to sell.`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const dateIso = transactionDate
        ? new Date(transactionDate).toISOString()
        : new Date().toISOString()

      const created = await createTransaction({
        portfolioId,
        assetId: assetSymbol,
        type,
        quantity: qty,
        price: unitPrice,
        transactionDate: dateIso,
        notes: notes.trim() || undefined,
      })

      await refreshLiveMarketCache()
      // Pequeña pausa para que el API persista la transacción antes del refresh
      await new Promise((r) => setTimeout(r, 300))
      if (IS_MOCK_MODE) await evaluateMockAlerts()

      setAnalysisLoading(true)
      let aiRefreshed = true
      try {
        await refreshAnalysisAfterTransaction(portfolioId, created)
      } catch {
        aiRefreshed = false
      } finally {
        setAnalysisLoading(false)
      }

      toast.success("Transaction saved", {
        description: aiRefreshed
          ? `${type === "BUY" ? "Bought" : "Sold"} ${qty} ${assetSymbol} · portfolio & AI analysis updated`
          : `${type === "BUY" ? "Bought" : "Sold"} ${qty} ${assetSymbol} · regenerate analysis in AI Insights if needed`,
      })

      setOpen(false)
      resetForm()
      await onSuccess?.()
      dispatchPortfolioUpdated(portfolioId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save transaction"
      setError(message)
      toast.error(message)
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
            Buy or sell at the current market price — saved to your portfolio and reflected in holdings.
          </DialogDescription>
        </DialogHeader>

        <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx-asset" className="text-[#A1A1AA]">
              Asset
            </Label>
            <Select
              value={assetSymbol}
              onValueChange={setAssetSymbol}
              disabled={
                assetsLoading ||
                selectableAssets.length === 0
              }
            >
              <SelectTrigger id="tx-asset" className="border-white/10 bg-[#111] text-white">
                <SelectValue
                  placeholder={
                    assetsLoading
                      ? "Loading…"
                      : type === "SELL" && holdings.length === 0
                        ? "No holdings to sell"
                        : "Select asset"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                {selectableAssets.map((a) => (
                  <SelectItem key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name}
                    {type === "SELL"
                      ? ` (${formatQuantity(holdings.find((h) => h.asset.symbol === a.symbol)?.quantity ?? 0)} held)`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {type === "SELL" && availableToSell != null && assetSymbol && (
              <p className="text-xs text-[#71717A]">
                Available to sell:{" "}
                <span className="font-mono text-[#C9A227]">
                  {formatQuantity(availableToSell)} {assetSymbol}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-type" className="text-[#A1A1AA]">
              Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as "BUY" | "SELL")}>
              <SelectTrigger id="tx-type" className="border-white/10 bg-[#111] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-qty" className="text-[#A1A1AA]">
                Quantity
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tx-qty"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="border-white/10 bg-[#111] font-mono text-white"
                  required
                />
                {type === "SELL" &&
                  availableToSell != null &&
                  availableToSell > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-white/10 text-xs text-white"
                      onClick={() =>
                        setQuantity(String(availableToSell))
                      }
                    >
                      Max
                    </Button>
                  )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="tx-price" className="text-[#A1A1AA]">
                  Unit price (USD)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#A1A1AA] hover:text-white"
                  disabled={!assetSymbol || priceLoading}
                  onClick={() => void loadMarketPrice(assetSymbol)}
                  aria-label="Refresh market price"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${priceLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <Input
                id="tx-price"
                type="text"
                readOnly
                value={
                  priceLoading
                    ? "Loading…"
                    : unitPrice != null
                      ? formatUnitPrice(unitPrice)
                      : "—"
                }
                className="border-[#C9A227]/40 bg-[#111] font-mono text-white"
              />
            </div>
          </div>

          {estimatedTotal != null && unitPrice != null && (
            <p className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-[#A1A1AA]">
              Estimated total:{" "}
              <span className="font-mono font-semibold text-[#C9A227]">
                {formatCurrency(estimatedTotal)}
              </span>
              <span className="text-[#71717A]">
                {" "}
                ({qty} × {formatCurrency(unitPrice)})
              </span>
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="tx-date" className="text-[#A1A1AA]">
              Date & time
            </Label>
            <Input
              id="tx-date"
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="border-white/10 bg-[#111] text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-notes" className="text-[#A1A1AA]">
              Notes (optional)
            </Label>
            <Input
              id="tx-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Educational note…"
              className="border-white/10 bg-[#111] text-white"
            />
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
            disabled={
              loading ||
              analysisLoading ||
              assetsLoading ||
              priceLoading ||
              unitPrice == null ||
              (type === "SELL" && selectableAssets.length === 0)
            }
            className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
          >
            {loading || analysisLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {analysisLoading ? "Updating AI…" : "Saving…"}
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
