"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pen, RotateCcw, CheckCircle2 } from "lucide-react"

interface DigitalSignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSign: (signatureDataUrl: string) => void
  psychologistName?: string
}

export function SignatureDialog({ open, onOpenChange, onSign, psychologistName }: DigitalSignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (open) {
      setHasSigned(false)
      setConfirmed(false)
      setTimeout(initCanvas, 100)
    }
  }, [open])

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
    setHasSigned(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSigned(false)
    setConfirmed(false)
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSigned) return
    setConfirmed(true)
    const dataUrl = canvas.toDataURL("image/png")
    onSign(dataUrl)
    setTimeout(() => onOpenChange(false), 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="h-5 w-5 text-blue-500" />
            Assinatura Digital
          </DialogTitle>
          <DialogDescription>
            {psychologistName ? `${psychologistName}, assine abaixo para encerrar o prontuário.` : "Assine para encerrar o prontuário da sessão."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden"
            style={{ height: 180 }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "100%", cursor: "crosshair" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!hasSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-muted-foreground">Assine aqui com o mouse ou toque</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Ao assinar, você confirma as informações do prontuário
            </p>
            <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 mr-1" /> Limpar
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!hasSigned || confirmed}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {confirmed ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Assinado</>
              ) : (
                <><Pen className="mr-2 h-4 w-4" /> Assinar e Encerrar</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}