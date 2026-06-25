import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Brain, Award, CheckCircle2, ChevronDown, ListTodo } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import { useTasks } from '../context/TaskContext'

type SoundPreset = 'none' | 'brown' | 'binaural' | 'cosmic'

export default function FocusRoom() {
  const { tasks, updateTask } = useTasks()

  // Task selection state
  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const [selectedTaskId, setSelectedTaskId] = useState<number | 'general'>('general')

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [totalDuration, setTotalDuration] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<any>(null)

  // Soundscape states
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('none')
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const soundNodesRef = useRef<any[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)

  // Breathing Coach state
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingText, setBreathingText] = useState('Inhale')
  const breathingTimerRef = useRef<any>(null)

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // XP / Success state
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [gainedXP, setGainedXP] = useState(0)

  // Get current active task title
  const activeTask = pendingTasks.find(t => t.id === selectedTaskId)
  const activeTaskTitle = activeTask ? activeTask.title : 'General Focus Session'

  // --- AUDIO SYNTHESIS ENGINE (Web Audio API) ---
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const gainNode = audioCtxRef.current.createGain()
      gainNode.gain.value = isMuted ? 0 : volume
      gainNode.connect(audioCtxRef.current.destination)
      gainNodeRef.current = gainNode
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const stopAllSounds = useCallback(() => {
    soundNodesRef.current.forEach(node => {
      try {
        node.stop()
      } catch (e) {}
      try {
        node.disconnect()
      } catch (e) {}
    })
    soundNodesRef.current = []
  }, [])

  const startSound = useCallback((preset: SoundPreset) => {
    stopAllSounds()
    if (preset === 'none' || !audioCtxRef.current) return

    const ctx = audioCtxRef.current
    const dest = gainNodeRef.current
    if (!dest) return

    if (preset === 'brown') {
      // Synthesize Brownian Noise (Waterfall/Rumble)
      const bufferSize = 2 * ctx.sampleRate
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = output[i]
        output[i] *= 3.5 // Compensate amplitude
      }

      const noiseSource = ctx.createBufferSource()
      noiseSource.buffer = noiseBuffer
      noiseSource.loop = true
      
      // Low pass filter to make it softer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, ctx.currentTime)

      noiseSource.connect(filter)
      filter.connect(dest)
      noiseSource.start()
      soundNodesRef.current.push(noiseSource)

    } else if (preset === 'binaural') {
      // 6Hz Theta Brainwave Entrainment (150Hz left / 156Hz right)
      const oscL = ctx.createOscillator()
      const oscR = ctx.createOscillator()
      const merger = ctx.createChannelMerger(2)
      
      oscL.frequency.value = 150
      oscR.frequency.value = 156

      // Separate channels
      const gainL = ctx.createGain()
      const gainR = ctx.createGain()

      oscL.connect(gainL)
      oscR.connect(gainR)

      gainL.connect(merger, 0, 0)
      gainR.connect(merger, 0, 1)

      merger.connect(dest)

      oscL.start()
      oscR.start()

      soundNodesRef.current.push(oscL, oscR)

    } else if (preset === 'cosmic') {
      // Generative space drone pad (C-minor chord with lfo mod)
      const frequencies = [65.41, 98.00, 130.81, 146.83, 196.00] // C2, G2, C3, D3, G3
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        // Triangle waves are softer
        osc.type = 'triangle'
        osc.frequency.value = freq

        // LFO volume modulator to create swirling ambient effect
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.1 + idx * 0.05
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 0.15

        const voiceGain = ctx.createGain()
        voiceGain.gain.value = 0.1

        lfo.connect(lfoGain)
        lfoGain.connect(voiceGain.gain)
        
        osc.connect(voiceGain)

        // Delay effect to give space
        const delay = ctx.createDelay()
        delay.delayTime.value = 0.4 + idx * 0.1
        const feedback = ctx.createGain()
        feedback.gain.value = 0.4

        voiceGain.connect(delay)
        delay.connect(feedback)
        feedback.connect(delay) // Feedback loop

        voiceGain.connect(dest)
        delay.connect(dest)

        osc.start()
        lfo.start()

        soundNodesRef.current.push(osc, lfo)
      })
    }
  }, [stopAllSounds])

  // Volume slider and mute controls
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Listen to preset changes
  useEffect(() => {
    if (soundPreset !== 'none') {
      initAudioContext()
      startSound(soundPreset)
    } else {
      stopAllSounds()
    }
  }, [soundPreset, startSound, stopAllSounds])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopAllSounds()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [stopAllSounds])

  // --- BREATHING COACH LOGIC ---
  useEffect(() => {
    if (!breathingActive) {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current)
      return
    }

    let phase = 0 // 0: inhale, 1: hold, 2: exhale
    setBreathingText('Inhale')

    breathingTimerRef.current = setInterval(() => {
      phase = (phase + 1) % 3
      if (phase === 0) {
        setBreathingText('Inhale')
      } else if (phase === 1) {
        setBreathingText('Hold')
      } else {
        setBreathingText('Exhale')
      }
    }, 4000)

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current)
    }
  }, [breathingActive])

  // --- TIMER LOOP ---
  const handleToggleTimer = () => {
    initAudioContext()
    setIsActive(!isActive)
  }

  const handleResetTimer = () => {
    setIsActive(false)
    setTimeRemaining(totalDuration)
  }

  const selectDuration = (minutes: number) => {
    setIsActive(false)
    const secs = minutes * 60
    setTotalDuration(secs)
    setTimeRemaining(secs)
  }

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Focus timer complete!
            clearInterval(timerRef.current)
            setIsActive(false)
            handleFocusComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  const handleFocusComplete = async () => {
    // Reward XP
    const minsCompleted = Math.round(totalDuration / 60)
    const xp = minsCompleted * 10
    setGainedXP(xp)
    setSessionCompleted(true)

    // Synthesize victory sound chime
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current
      const now = ctx.currentTime
      const chime1 = ctx.createOscillator()
      const chime2 = ctx.createOscillator()
      const chimeGain = ctx.createGain()
      
      chime1.type = 'sine'
      chime1.frequency.setValueAtTime(523.25, now) // C5
      chime1.frequency.setValueAtTime(659.25, now + 0.15) // E5
      chime1.frequency.setValueAtTime(783.99, now + 0.3) // G5
      chime1.frequency.setValueAtTime(1046.50, now + 0.45) // C6

      chime2.type = 'triangle'
      chime2.frequency.setValueAtTime(261.63, now) // C4
      chime2.frequency.setValueAtTime(329.63, now + 0.15) // E4
      chime2.frequency.setValueAtTime(392.00, now + 0.3) // G4
      chime2.frequency.setValueAtTime(523.25, now + 0.45) // C5

      chimeGain.gain.setValueAtTime(0.2, now)
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

      chime1.connect(chimeGain)
      chime2.connect(chimeGain)
      chimeGain.connect(ctx.destination)

      chime1.start(now)
      chime2.start(now)
      chime1.stop(now + 1.5)
      chime2.stop(now + 1.5)
    }

    // Auto mark task as completed or in-progress if selected
    if (selectedTaskId !== 'general') {
      try {
        await updateTask(selectedTaskId, { status: 'completed' })
      } catch (err) {}
    }
  }

  // --- CANVAS VISUALIZER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Wave parameters
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Only draw waves when timer is active
      if (isActive) {
        phase += 0.015

        // Draw multiple overlapping colored sine waves
        for (let w = 0; w < 3; w++) {
          ctx.beginPath()
          ctx.strokeStyle = w === 0 
            ? 'rgba(139, 92, 246, 0.15)' // Violet
            : w === 1 
            ? 'rgba(6, 182, 212, 0.12)'  // Cyan
            : 'rgba(236, 72, 153, 0.08)'  // Pink

          ctx.lineWidth = w === 0 ? 3 : 1.5
          
          const amplitude = 30 - w * 6
          const frequency = 0.005 + w * 0.002

          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * frequency + phase + w) * amplitude
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isActive])

  // Timer formatted text
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Progress circle percentages
  const progressPercent = ((totalDuration - timeRemaining) / totalDuration) * 100
  const strokeDashoffset = 283 - (283 * progressPercent) / 100

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-violet-400 animate-pulse" />
          Distraction-Free Focus Room
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Lock in, block anxiety, and crush deadlines with binaural beats and interactive breathing.
        </p>
      </div>

      <AnimatePresence>
        {sessionCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4"
          >
            <GlassCard glow="cyan" className="p-6 border-emerald-500/30 bg-emerald-950/20">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Focus Session Complete!</h3>
                    <p className="text-sm text-slate-300">
                      Awesome job. You focused for {Math.round(totalDuration / 60)} minutes on: <strong>{activeTaskTitle}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-4 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    +{gainedXP} XP
                  </div>
                  <button
                    onClick={() => setSessionCompleted(false)}
                    className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] rounded-xl text-white text-xs font-semibold transition-all"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Setup & Task select */}
        <div className="space-y-6 lg:col-span-1">
          {/* Target Task Select */}
          <GlassCard>
            <div className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-violet-400" />
                Select Focus Goal
              </h2>
              <div className="relative">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value === 'general' ? 'general' : Number(e.target.value))}
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                >
                  <option value="general" className="bg-[#0f0f15] text-white">General Focus (No specific task)</option>
                  {pendingTasks.map(task => (
                    <option key={task.id} value={task.id} className="bg-[#0f0f15] text-white">
                      [{task.priority.toUpperCase()}] {task.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Completing a selected task session automatically updates its status to "Done" and records productivity points.
              </p>
            </div>
          </GlassCard>

          {/* Soundscapes synthesis panel */}
          <GlassCard>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Focus Soundscapes</h2>
                {soundPreset !== 'none' && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                  </button>
                )}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', name: 'Silence', desc: 'No background audio' },
                  { id: 'brown', name: 'Brown Noise', desc: 'Deep waterfall rumble' },
                  { id: 'binaural', name: 'Binaural beats', desc: '6Hz Theta focus' },
                  { id: 'cosmic', name: 'Cosmic Drone', desc: 'Synthesized space pad' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSoundPreset(item.id as SoundPreset)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      soundPreset === item.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              {soundPreset !== 'none' && (
                <div className="space-y-2 border-t border-white/[0.05] pt-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Synthesizer Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </GlassCard>

          {/* Breathing Coach Switch */}
          <GlassCard>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Anxiety Breathing Coach</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle box for calming breathing exercises.</p>
                </div>
                <button
                  onClick={() => setBreathingActive(!breathingActive)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    breathingActive ? 'bg-violet-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                    breathingActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <AnimatePresence>
                {breathingActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col items-center justify-center py-2"
                  >
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: breathingText === 'Inhale' ? 1.6 : breathingText === 'Hold' ? 1.6 : 1.0,
                          backgroundColor: breathingText === 'Inhale' 
                            ? 'rgba(139, 92, 246, 0.15)' 
                            : breathingText === 'Hold' 
                            ? 'rgba(6, 182, 212, 0.15)' 
                            : 'rgba(236, 72, 153, 0.1)'
                        }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full border border-white/5"
                      />
                      <span className="text-xs font-bold text-white uppercase tracking-wider relative z-10 animate-pulse">
                        {breathingText}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4 font-mono">Box breathing loop active (4s cycle)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Right column: Interactive Main Timer */}
        <div className="lg:col-span-2 flex flex-col justify-stretch">
          <GlassCard glow={isActive ? 'purple' : 'none'} className="flex-1 flex flex-col justify-between overflow-hidden relative p-8">
            {/* Visualizer Background */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-6">
              {/* Target/Goal Label */}
              <div className="mb-8 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Focus Goal: <strong>{activeTaskTitle}</strong></span>
              </div>

              {/* Glowing Timer Circle */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="90"
                    className="stroke-white/[0.03] fill-none"
                    strokeWidth="8"
                  />
                  {/* Active Ring */}
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="90"
                    className="stroke-violet-500 fill-none"
                    strokeWidth="8"
                    strokeDasharray="565"
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Face */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-white tracking-tighter select-none font-mono">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 select-none">
                    {isActive ? 'Deep Focus' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={handleResetTimer}
                  className="p-3.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleTimer}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white border shadow-lg transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20 text-amber-400'
                      : 'bg-gradient-to-r from-violet-500 to-cyan-500 border-white/10 hover:opacity-95'
                  }`}
                >
                  {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                </motion.button>
              </div>
            </div>

            {/* Presets footer durations */}
            <div className="relative z-10 border-t border-white/[0.05] pt-6 flex justify-around flex-wrap gap-2">
              {[
                { label: 'Pomodoro', mins: 25 },
                { label: 'Deep Focus', mins: 50 },
                { label: 'Short Break', mins: 5 },
                { label: 'Long Break', mins: 15 }
              ].map(d => (
                <button
                  key={d.label}
                  onClick={() => selectDuration(d.mins)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    totalDuration === d.mins * 60
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {d.label} ({d.mins}m)
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
