import { useState, useRef, useEffect } from 'react'

export type VoiceState = 'idle' | 'listening' | 'error'

// Inline types for Web Speech API (not in standard TypeScript lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}
interface SpeechRecognitionAlternative {
  transcript: string
}

export function useVoiceInput() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any>(null)
  const activeRef = useRef(false)
  const finalRef = useRef('')
  const resultIndexRef = useRef(0)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [])

  function start(onFinal: (text: string) => void) {
    if (!isSupported || activeRef.current) return
    activeRef.current = true

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    finalRef.current = ''
    resultIndexRef.current = 0

    rec.onstart = () => setVoiceState('listening')

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = resultIndexRef.current; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          finalRef.current += result[0].transcript + ' '
          resultIndexRef.current = i + 1
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(finalRef.current + interim)
    }

    rec.onend = () => {
      activeRef.current = false
      setVoiceState('idle')
      setInterimText('')
      if (finalRef.current.trim()) {
        onFinal(finalRef.current.trim())
      }
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      activeRef.current = false
      if (e.error !== 'no-speech') {
        setVoiceState('error')
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setVoiceState('idle'), 1500)
      } else {
        setVoiceState('idle')
      }
      setInterimText('')
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stop() {
    recognitionRef.current?.stop()
  }

  return { voiceState, interimText, isSupported, start, stop }
}
