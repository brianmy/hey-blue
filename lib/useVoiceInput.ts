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
  const finalRef = useRef('')
  const resultIndexRef = useRef(0)

  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  function start(onFinal: (text: string) => void) {
    if (!isSupported || voiceState === 'listening') return

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
      // Only process results we haven't seen yet
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
      setVoiceState('idle')
      setInterimText('')
      if (finalRef.current.trim()) {
        onFinal(finalRef.current.trim())
      }
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'no-speech') setVoiceState('error')
      else setVoiceState('idle')
      setInterimText('')
      setTimeout(() => setVoiceState('idle'), 1500)
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stop() {
    recognitionRef.current?.stop()
  }

  return { voiceState, interimText, isSupported, start, stop }
}
