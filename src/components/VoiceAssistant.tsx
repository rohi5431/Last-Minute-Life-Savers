import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Loader2, Play } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import AnimatedButton from './ui/AnimatedButton'
import { productivity as apiProductivity } from '../services/api'
import { useTasks } from '../context/TaskContext'

export default function VoiceAssistant() {
  const { refreshAll } = useTasks()
  const [isListening, setIsListening] = useState(false)
  const [textToSpeech, setTextToSpeech] = useState(true)
  const [inputMessage, setInputMessage] = useState('')
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript
        setTranscript(resultText)
        handleSubmitMessage(resultText)
      }

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          setError('Microphone permission blocked. Please check your browser settings.')
        } else {
          setError(`Voice input error: ${event.error}`)
        }
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    } else {
      console.warn('Web Speech API is not supported in this browser.')
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser. Please type your command below.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  const speakText = (text: string) => {
    if (!textToSpeech || !window.speechSynthesis) return
    window.speechSynthesis.cancel() // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  const handleSubmitMessage = async (msg: string) => {
    if (!msg.trim()) return
    setLoading(true)
    setError(null)
    setTranscript(msg)
    try {
      const res = await apiProductivity.askAssistant(msg)
      setAiResponse(res.response)
      
      // Speak response if text-to-speech is enabled
      speakText(res.response)

      // If the action_taken indicated optimization/scheduling, refresh dashboard data
      if (res.action_taken) {
        await refreshAll()
      }
    } catch (err: any) {
      setError('Failed to reach AI Assistant. Please check backend status.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    handleSubmitMessage(inputMessage)
    setInputMessage('')
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-violet-400" />
            AI Voice Companion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Talk to LifeSaver. Ask to optimize your schedule, check conflicts, or prioritize tasks.
          </p>
        </div>

        {/* Text-to-Speech Toggle */}
        <button
          onClick={() => {
            setTextToSpeech(!textToSpeech)
            if (textToSpeech) window.speechSynthesis?.cancel()
          }}
          className={`p-2 rounded-xl border transition-all ${
            textToSpeech
              ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
              : 'bg-white/[0.02] text-slate-500 border-white/[0.05] hover:text-slate-400'
          }`}
          title={textToSpeech ? 'Mute AI Voice' : 'Enable AI Voice'}
        >
          {textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Mic Card */}
        <div className="lg:col-span-1 flex flex-col">
          <GlassCard 
            glow="purple" 
            className="p-6 w-full min-h-[300px] flex flex-col"
            contentClassName="w-full h-full flex flex-col items-center justify-center flex-1"
          >
            <span className="text-xs text-slate-400 mb-6 uppercase tracking-wider">
              {isListening ? 'Listening...' : 'Click to Speak'}
            </span>

            {/* Pulsing Mic Button */}
            <div className="relative w-16 h-16">
              {isListening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-violet-500/30 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute inset-0 bg-cyan-500/20 rounded-full"
                  />
                </>
              )}
              <motion.button
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                  isListening
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-gradient-to-br from-violet-500 to-cyan-500 border-white/10 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>
            </div>

            <p className="text-xs text-slate-500 mt-6 text-center max-w-[200px]">
              Try saying: <br />
              <strong className="text-slate-300">"optimize my schedule"</strong> or <br />
              <strong className="text-slate-300">"how many tasks do I have today?"</strong>
            </p>
          </GlassCard>
        </div>

        {/* Conversation History Card */}
        <div className="lg:col-span-2 flex flex-col">
          <GlassCard hover={false} className="p-5 flex-1 flex flex-col min-h-[300px] justify-between">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-semibold text-white">Assistant Output</h3>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/5 border border-red-400/10 rounded-xl px-3 py-2.5">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* User Transcript */}
                {transcript && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-violet-600/20 border border-violet-500/20 px-4 py-2.5 text-sm text-slate-200">
                      <span className="text-[10px] text-violet-400 block mb-0.5 font-semibold">You said</span>
                      {transcript}
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {loading ? (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.05] px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                ) : (
                  aiResponse && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-cyan-950/20 border border-cyan-500/20 px-4 py-2.5 text-sm text-slate-200">
                        <span className="text-[10px] text-cyan-400 block mb-0.5 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Assistant
                        </span>
                        {aiResponse}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Text Input Fallback */}
            <form onSubmit={handleTextInputSubmit} className="mt-4 pt-3 border-t border-white/[0.05] flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a command to your productivity companion..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
              />
              <AnimatedButton
                type="submit"
                variant="gradient"
                className="px-3"
                disabled={!inputMessage.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </AnimatedButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
