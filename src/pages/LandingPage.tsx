import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Clock, Target, Brain, Shield, Users, Play, CheckCircle2, Mail, Linkedin, Github, Heart, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import FloatingBlobs from '../components/ui/FloatingBlobs'
import GlassCard from '../components/ui/GlassCard'
import AnimatedButton from '../components/ui/AnimatedButton'
import FAQAccordion from '../components/ui/FAQAccordion'

const features = [
  {
    icon: Brain,
    title: 'AI Task Planning',
    description: 'Describe your goal and deadline. Let AI break it down into actionable steps.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Tasks are automatically scheduled around your calendar and preferences.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Target,
    title: 'Priority Intelligence',
    description: 'AI analyzes deadlines, dependencies, and urgency to prioritize perfectly.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Zap,
    title: 'Real-time Adaptation',
    description: 'As you work, the system adapts and re-prioritizes your schedule.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Deadline Protection',
    description: 'Never miss a deadline again with proactive alerts and reminders.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share goals, assign tasks, and track progress with your team.',
    gradient: 'from-indigo-500 to-blue-500',
  },
]

const steps = [
  {
    step: '01',
    title: 'Define Your Goal',
    description: 'Enter your goal and deadline in simple language',
    detailText: 'Type exactly what you want to achieve—whether it is preparing for an exam, writing a thesis, or launching a startup.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'
  },
  {
    step: '02',
    title: 'AI Plans It Out',
    description: 'AI splits your goal into prioritized tasks',
    detailText: 'Our advanced engine automatically creates an optimized path of dependencies, scheduling tasks in logical sequences.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'
  },
  {
    step: '03',
    title: 'Execute & Track',
    description: 'Follow the schedule with real-time guidance',
    detailText: 'Focus on one task at a time. The system actively monitors calendar changes and handles dynamic rescheduling in the background.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
  },
  {
    step: '04',
    title: 'Achieve Success',
    description: 'Complete your goal before the deadline',
    detailText: 'Watch your productivity streaks grow and complete your goals stress-free, well before the final deadline arrives.',
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=600&q=80'
  },
]

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Startup Founder',
    content: 'Last-Minute Life Saver helped me launch my MVP in 30 days instead of 3 months. Game changer!',
    avatar: '/alex_avatar.png'
  },
  {
    name: 'Sarah Miller',
    role: 'Graduate Student',
    content: 'Managed to write my entire thesis before the deadline. The AI scheduling is incredibly smart.',
    avatar: '/sarah_avatar.png'
  },
  {
    name: 'David Park',
    role: 'Product Manager',
    content: 'Our team productivity increased by 40%. No more missed deadlines or forgotten tasks.',
    avatar: '/david_avatar.png'
  },
  {
    name: 'Emily Watson',
    role: 'Lead Software Engineer',
    content: 'The Google Calendar real-time sync is flawless. It automatically shifts my tasks when my meetings run over. Invaluable for sprint crunch!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Marcus Thompson',
    role: 'Freelance UX Designer',
    content: 'I manage 5 client projects simultaneously. The adaptive AI planner keeps my priorities straight and saved me from 3 late submissions this month!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Dr. Amanda Ross',
    role: 'Academic Researcher',
    content: 'My research papers involve complex dependencies. LifeSaver maps out my literature reviews and draft cycles with zero friction. Outstanding!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
  },
]

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Goals Completed' },
  { value: '99.2%', label: 'Deadline Success' },
  { value: '4.9', label: 'App Rating' },
]

const faqs = [
  { question: 'How does AI task planning work?', answer: 'Our AI analyzes your goal description, deadline, and preferences to break it down into manageable tasks. It considers task dependencies, estimated time, and optimal scheduling based on your patterns.' },
  { question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption for all data. Your tasks and goals are private and never shared with third parties. We follow strict data protection regulations.' },
  { question: 'Can I use it for team projects?', answer: 'Yes! Our team plans support collaboration with shared goals, task assignments, team calendars, and real-time progress tracking for everyone.' },
  { question: 'What integrations are available?', answer: 'We integrate with Google Calendar, Slack, Microsoft Teams, Notion, and 20+ other productivity tools. More integrations are added monthly.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [goalInput, setGoalInput] = useState('')
  const [timeFrame, setTimeFrame] = useState('3h')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any[] | null>(null)

  const handleRescue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalInput.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      const parsedHours = parseFloat(timeFrame) || 3
      setGeneratedPlan([
        {
          id: 1,
          title: `Analyze & break down: ${goalInput.length > 28 ? goalInput.substring(0, 28) + '...' : goalInput}`,
          duration: `${Math.round(parsedHours * 0.2 * 10) / 10}h`,
          color: 'from-violet-500 to-indigo-500'
        },
        {
          id: 2,
          title: `Build core functionality of ${goalInput.length > 28 ? goalInput.substring(0, 28) + '...' : goalInput}`,
          duration: `${Math.round(parsedHours * 0.55 * 10) / 10}h`,
          color: 'from-cyan-500 to-blue-500'
        },
        {
          id: 3,
          title: `Final testing, layout polish & deployment`,
          duration: `${Math.round(parsedHours * 0.25 * 10) / 10}h`,
          color: 'from-emerald-500 to-teal-500'
        }
      ])
      setIsGenerating(false)
    }, 1200)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <FloatingBlobs />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">LifeSaver</span>
              </motion.div>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it Works</a>
                <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Testimonials</a>
                <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Sign in
                </button>
                <AnimatedButton onClick={() => navigate('/signup')}>
                  Get Started
                </AnimatedButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Deadline Rescue
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
              >
                Stop Planning.
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Start Executing.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto"
              >
                Transform panic into progress. Drop your deadline and let AI handle the planning,
                prioritizing, and scheduling.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <AnimatedButton
                  variant="gradient"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => navigate('/signup')}
                >
                  Get Started Free
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  size="lg"
                  icon={<Play className="w-5 h-5" />}
                  iconPosition="left"
                >
                  Watch Demo
                </AnimatedButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-sm text-slate-500"
              >
                No credit card required · Free forever plan available
              </motion.p>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-5xl mx-auto mt-20"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <GlassCard key={i} className="text-center" hover={false}>
                  <div className="p-6">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Dashboard Showcase Section */}
        <section className="py-20 lg:py-32 px-6 border-b border-white/[0.05] bg-[#08080c]/50">
          <div className="max-w-[85rem] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Product Walkthrough
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Step Into Your AI-Powered Control Center
              </h2>
              <p className="text-slate-400 text-lg">
                Explore the high-fidelity features engineered to rescue your timeline and automate schedule management.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left Column - 2 Features/Images */}
              <div className="space-y-16">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4 text-left"
                >
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#07070a] p-1.5 glass glow-purple overflow-hidden hover:scale-[1.02] transition-all duration-500 ease-out group max-w-[32rem]">
                    <img
                      src="/dashboard_mockup.png"
                      alt="AI Core Planner Screen"
                      className="rounded-xl w-full aspect-video object-cover border border-white/[0.05]"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">01. Intelligent AI Task Decomposition</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Simply describe your goal in natural language. Our AI splits it into a series of structured, sequential tasks automatically tailored to your deadlines.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#07070a] p-1.5 glass glow-cyan overflow-hidden hover:scale-[1.02] transition-all duration-500 ease-out group max-w-[32rem]">
                    <img
                      src="https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=800&q=80"
                      alt="Interactive Timeline Screen"
                      className="rounded-xl w-full aspect-video object-cover border border-white/[0.05]"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">02. Visual Schedule & Progress Timeline</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    View your tasks placed beautifully in custom-allocated calendar blocks. Monitor progress, drag slots, and customize details interactively.
                  </p>
                </motion.div>
              </div>

              {/* Right Column - 2 Features/Images */}
              <div className="space-y-16 md:mt-24">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4 text-left"
                >
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#07070a] p-1.5 glass glow-cyan overflow-hidden hover:scale-[1.02] transition-all duration-500 ease-out group max-w-[32rem]">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                      alt="Google Calendar Connection Screen"
                      className="rounded-xl w-full aspect-video object-cover border border-white/[0.05]"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">03. Google Calendar Synchronization</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Seamlessly connect your work and personal accounts. Real-time background sync checks for external event conflicts automatically.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#07070a] p-1.5 glass glow-purple overflow-hidden hover:scale-[1.02] transition-all duration-500 ease-out group max-w-[32rem]">
                    <img
                      src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
                      alt="Real-time Conflict Resolution Screen"
                      className="rounded-xl w-full aspect-video object-cover border border-white/[0.05]"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">04. Real-time Adaptive Scheduling</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Missed a target? Got a last-minute appointment? Our Celery background worker reprioritizes your tasks and shifts slots instantly.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                Powerful Features
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Everything you need to conquer deadlines
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="h-full group">
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                How It Works
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                From chaos to clarity in 4 steps
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="h-full group overflow-hidden">
                    <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                      {/* Left Side: Text Content */}
                      <div className="flex-1 space-y-3 text-left">
                        <div className="text-4xl font-bold bg-gradient-to-r from-violet-500/35 to-cyan-500/35 bg-clip-text text-transparent">
                          {step.step}
                        </div>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                        <p className="text-slate-500 text-xs italic leading-relaxed">{step.detailText}</p>
                      </div>

                      {/* Right Side: Mini Computer Screen Mockup (Enlarged Size) */}
                      <div className="w-full sm:w-52 h-32 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-[#07070a] flex flex-col glow-purple/10 group-hover:border-white/20 transition-all duration-300">
                        {/* Mockup Title/Bar */}
                        <div className="h-4 bg-white/[0.03] flex items-center gap-1.5 px-2.5 border-b border-white/[0.05]">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60" />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                        </div>
                        {/* Mockup Screen Image */}
                        <div className="flex-1 overflow-hidden relative">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Testimonials
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Loved by thousands of users
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="h-full">
                    <div className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.542L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.638 1.123 6.542z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div className="text-left">
                          <div className="font-medium text-white text-sm">{testimonial.name}</div>
                          <div className="text-slate-500 text-xs">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 lg:py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <CheckCircle2 className="w-4 h-4" />
                FAQ
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <FAQAccordion items={faqs} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <GlassCard>
              <div className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                  {/* Left Side: Content */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="space-y-4"
                    >
                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Ready to rescue your deadlines?
                      </h2>
                      <p className="text-slate-400 max-w-xl leading-relaxed">
                        Join 50,000+ users who have transformed their panic into progress. Experience real-time, adaptive AI scheduling that automatically re-prioritizes your life in seconds.
                      </p>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <AnimatedButton
                          variant="gradient"
                          size="lg"
                          icon={<ArrowRight className="w-5 h-5" />}
                          onClick={() => navigate('/signup')}
                        >
                          Get Started Free
                        </AnimatedButton>
                      </div>

                      {/* Impressive Trust Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Google Calendar Sync</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Real-Time Adapting</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Side: Interactive AI Simulator */}
                  <div className="lg:col-span-5 w-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="relative rounded-2xl border border-white/[0.08] bg-[#07070a] p-6 glass glow-purple overflow-hidden text-left"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <span className="text-xs font-semibold text-white tracking-wider uppercase">AI Planner Sandbox</span>
                      </div>

                      {!generatedPlan ? (
                        <form onSubmit={handleRescue} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-medium">What is your last-minute goal?</label>
                            <input
                              type="text"
                              required
                              value={goalInput}
                              onChange={(e) => setGoalInput(e.target.value)}
                              placeholder="e.g., Design presentation slide deck"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-medium">How many hours left until deadline?</label>
                            <select
                              value={timeFrame}
                              onChange={(e) => setTimeFrame(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                            >
                              <option value="2h">2 Hours (Extremely Urgent)</option>
                              <option value="4h">4 Hours (Highly Urgent)</option>
                              <option value="8h">8 Hours (Standard Crunch)</option>
                              <option value="24h">24 Hours (Next Day)</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            disabled={isGenerating || !goalInput.trim()}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isGenerating ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Analyzing Goals...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Rescue My Deadline
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Your Optimized Timeline:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratedPlan(null);
                                setGoalInput('');
                              }}
                              className="text-xs text-violet-400 hover:underline"
                            >
                              Reset Sandbox
                            </button>
                          </div>

                          {/* Animated Plan Steps */}
                          <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.05]">
                            {generatedPlan.map((step, idx) => (
                              <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.15 }}
                                className="flex items-start gap-4 relative"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center shrink-0">
                                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${step.color}`} />
                                </div>
                                <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex items-center justify-between gap-3">
                                  <div className="space-y-0.5">
                                    <h4 className="text-xs font-semibold text-white leading-tight">{step.title}</h4>
                                    <p className="text-[10px] text-slate-500">Allocated block</p>
                                  </div>
                                  <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">{step.duration}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <button
                            onClick={() => navigate('/signup')}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Lock in This Schedule (Free)
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-white/[0.05] bg-[#07070a]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
              {/* Brand and Description */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-lg">LifeSaver</span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  Transform panic into progress. Our AI-driven dynamic schedule adaptive planner protects your deadlines and automatically re-prioritizes tasks in real-time.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  All Systems Operational
                </div>
              </div>

              {/* Hackathon Credentials & Links */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>
                    <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                      System Health <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                      GitHub Repository <Github className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    <span className="text-slate-500">
                      Built for GenAI Hackathon
                    </span>
                  </li>
                </ul>
              </div>

              {/* Contact & Socials */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get in Touch</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <a href="mailto:team@lifesaver.app" className="hover:text-white transition-colors flex items-center gap-2">
                      <Mail className="w-4 h-4 text-violet-400" />
                      team@lifesaver.app
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-cyan-400" />
                      LinkedIn Profile
                    </a>
                  </li>
                  <li>
                    <span className="text-slate-500 flex items-center gap-1">
                      Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Team LifeSaver
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Last-Minute Life Saver. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
