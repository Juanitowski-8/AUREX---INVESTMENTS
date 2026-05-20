"use client"

import { useState } from "react"
import { FolderPlus, Loader2 } from "lucide-react"
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
import { createPortfolio } from "@/services/portfolio.service"

type CreatePortfolioDialogProps = {
  onCreated: () => void | Promise<void>
  trigger?: React.ReactNode
}

export function CreatePortfolioDialog({
  onCreated,
  trigger,
}: CreatePortfolioDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    try {
      await createPortfolio({ name: trimmed })
      setName("")
      setOpen(false)
      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create portfolio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]">
            <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
            Create Portfolio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create portfolio</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Start tracking simulated holdings in a new portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio-name" className="text-[#A1A1AA]">
              Portfolio name
            </Label>
            <Input
              id="portfolio-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My simulated portfolio"
              className="border-white/10 bg-[#111] text-white"
              disabled={loading}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-[#FF3B30]" role="alert">
              {error}
            </p>
          )}
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
              disabled={loading || !name.trim()}
              className="bg-[#C9A227] text-[#0A0A0A] hover:bg-[#E8C547]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
