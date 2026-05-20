"use client"

import { useMemo, useState } from "react"
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
import { dispatchPortfolioUpdated } from "@/lib/portfolio/portfolio-events"
import { IS_MOCK_MODE } from "@/lib/config"
import { createTransaction } from "@/services/portfolio.service"
import type { Holding, TransactionType } from "@/types"

type AddTransactionDialogProps = {
  holdings: Holding[]
  portfolioId: string
}

export function AddTransactionDialog({
  holdings,
  portfolioId,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [assetId, setAssetId] = useState("")
  const [type, setType] = useState<TransactionType>("BUY")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const defaultAssetId = holdings[0]?.assetId ?? ""

  const selectedHolding = useMemo(() => {
    const id = assetId || defaultAssetId
    return holdings.find((h) => h.assetId === id)
  }, [assetId, defaultAssetId, holdings])

  const resetFormOnOpen = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      const first = holdings[0]?.assetId ?? ""
      setAssetId(first)
      setType("BUY")
      setQuantity("")
      setPrice(
        holdings[0]?.asset.price != null
          ? String(holdings[0]!.asset.price)
          : ""
      )
      setError(null)
      setSubmitting(false)
      setDone(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const q = Number(quantity)
    const p = Number(price)
    if (!Number.isFinite(q) || q <= 0) {
      setError("Introduce una cantidad válida mayor que cero.")
      return
    }
    if (!Number.isFinite(p) || p < 0) {
      setError("Introduce un precio válido (≥ 0).")
      return
    }
    const resolvedAsset = assetId || defaultAssetId
    if (!resolvedAsset) {
      setError("No hay activos en el portafolio para operar.")
      return
    }
    if (type === "SELL") {
      const maxQty = selectedHolding?.quantity ?? 0
      if (q > maxQty + 1e-9) {
        setError(
          `No puedes vender más de lo que tienes (${maxQty.toLocaleString("en-US", { maximumFractionDigits: 8 })}).`
        )
        return
      }
    }

    setSubmitting(true)
    try {
      await createTransaction({
        portfolioId,
        assetId: resolvedAsset,
        type,
        quantity: q,
        price: p,
      })
      dispatchPortfolioUpdated(portfolioId)
      setDone(true)
    } catch {
      setError(
        "No se pudo registrar la transacción. Comprueba la conexión con el API o vuelve a intentarlo."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOpen(false)
      setDone(false)
      setError(null)
      return
    }
    resetFormOnOpen(true)
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
          <DialogTitle>Añadir transacción</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {IS_MOCK_MODE
              ? "Modo simulado: la cartera se actualiza al instante en este navegador."
              : "Se envía a POST /api/transactions y se actualiza el portafolio desde el servidor."}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="rounded-lg border border-[#00D084]/20 bg-[#00D084]/10 px-4 py-3 text-sm text-[#00D084]">
            Transacción registrada. El resumen y las posiciones se han actualizado.
          </div>
        ) : (
          <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-3 py-2 text-sm text-[#FF6B6B]">
                {error}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="tx-asset" className="text-[#A1A1AA]">
                Activo
              </Label>
              <Select
                value={assetId || defaultAssetId}
                onValueChange={setAssetId}
                disabled={holdings.length === 0}
              >
                <SelectTrigger
                  id="tx-asset"
                  className="border-white/10 bg-[#111] text-white"
                >
                  <SelectValue placeholder="Selecciona activo" />
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
                  Tipo
                </Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as TransactionType)}
                >
                  <SelectTrigger
                    id="tx-type"
                    className="border-white/10 bg-[#111] text-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111] text-white">
                    <SelectItem value="BUY">Compra</SelectItem>
                    <SelectItem value="SELL">Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-qty" className="text-[#A1A1AA]">
                  Cantidad
                </Label>
                <Input
                  id="tx-qty"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="border-white/10 bg-[#111] font-mono text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-price" className="text-[#A1A1AA]">
                Precio unitario (USD)
              </Label>
              <Input
                id="tx-price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border-white/10 bg-[#111] font-mono text-white"
                required
              />
            </div>
          </form>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {done ? (
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="add-tx-form"
                className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
                disabled={submitting || holdings.length === 0}
              >
                {submitting ? "Guardando…" : "Guardar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
