'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, RotateCcw, CheckCircle, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KycCameraCaptureProps {
  label: string
  hint: string
  value: string | null           // base64 data URL
  onChange: (dataUrl: string | null) => void
  accept?: string
}

export function KycCameraCapture({ label, hint, value, onChange, accept = 'image/*' }: KycCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<'idle' | 'camera' | 'captured'>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  async function startCamera(facing: 'environment' | 'user' = facingMode) {
    setCameraError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('camera')
    } catch {
      setCameraError('Camera access denied. Please allow camera permission or upload a file instead.')
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopCamera()
    onChange(dataUrl)
    setMode('captured')
  }

  function retake() {
    onChange(null)
    setMode('idle')
  }

  function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange(ev.target?.result as string)
      setMode('captured')
    }
    reader.readAsDataURL(file)
  }

  // captured state
  if (mode === 'captured' && value) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="relative rounded-xl overflow-hidden border-2 border-green-500/60 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full max-h-52 object-contain" />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={retake}
              className="flex items-center gap-1 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white hover:bg-black/90 transition-colors"
            >
              <RotateCcw className="size-3" />
              Retake
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-green-600/90 px-2 py-1">
            <CheckCircle className="size-3 text-white" />
            <span className="text-xs text-white font-medium">Captured</span>
          </div>
        </div>
      </div>
    )
  }

  // camera live view
  if (mode === 'camera') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Document guide overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Corner marks for ID card framing */}
            <div className="relative h-[68%] w-[85%]">
              {/* Top-left */}
              <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-gold rounded-tl-sm" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-gold rounded-tr-sm" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-gold rounded-bl-sm" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-gold rounded-br-sm" />
              <p className="absolute -bottom-6 inset-x-0 text-center text-[11px] text-white/70">
                Align document inside the frame
              </p>
            </div>
          </div>
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={() => { stopCamera(); setMode('idle') }}
              className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs text-white backdrop-blur hover:bg-black/80 transition-colors border border-white/20"
            >
              <X className="size-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={capture}
              className="flex items-center gap-1.5 rounded-xl bg-gold px-5 py-2 text-sm font-semibold text-dark hover:bg-gold/90 transition-colors"
            >
              <Camera className="size-4" /> Capture
            </button>
            <button
              type="button"
              onClick={flipCamera}
              className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 text-xs text-white backdrop-blur hover:bg-black/80 transition-colors border border-white/20"
            >
              <RotateCcw className="size-3.5" /> Flip
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  // idle state
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {cameraError && (
        <p className="text-xs text-red-500">{cameraError}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => startCamera()}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5',
            'border-gold/40 bg-gold/5 hover:bg-gold/10 hover:border-gold/60',
            'transition-colors text-center'
          )}
        >
          <Camera className="size-6 text-gold" />
          <span className="text-xs font-medium text-foreground">Use Camera</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5',
            'border-border bg-muted/20 hover:bg-muted/40 hover:border-border/80',
            'transition-colors text-center'
          )}
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Upload File</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
