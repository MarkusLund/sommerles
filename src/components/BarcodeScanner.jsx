import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'

// Kamera-overlay som leser strekkoden (EAN-13 = ISBN-13) på baksiden av en bok.
// Kaller onDetected(isbn) ved første treff, og onClose() når brukeren lukker.
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
    ])
    const reader = new BrowserMultiFormatReader(hints)
    let cancelled = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
        if (controls && !controlsRef.current) controlsRef.current = controls
        if (result && !cancelled) {
          cancelled = true
          controlsRef.current?.stop()
          onDetected(result.getText())
        }
      })
      .catch(() => {
        if (!cancelled) setError('Fikk ikke tilgang til kameraet. Sjekk at du har gitt tillatelse.')
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onDetected])

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-box" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-title">📷 Skann strekkoden på boka</div>
        {error ? (
          <p className="scanner-error">{error}</p>
        ) : (
          <div className="scanner-video-wrap">
            <video ref={videoRef} className="scanner-video" muted playsInline />
            <div className="scanner-reticle" />
          </div>
        )}
        <p className="scanner-hint">Hold strekkoden (de svarte strekene) innenfor rammen.</p>
        <button type="button" className="scanner-close" onClick={onClose}>
          Lukk
        </button>
      </div>
    </div>
  )
}
