'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export default function QRCodeDisplay({ url, size = 180 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#ff2d78',
          light: '#12121f',
        },
      })
    }
  }, [url, size])

  return <canvas ref={canvasRef} className="rounded-lg" />
}
