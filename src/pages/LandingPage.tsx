import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Clock, Target, Brain, Shield, Users, Play, CheckCircle2 } from 'lucide-react'
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
  { step: '01', title: 'Define Your Goal', description: 'Enter your goal and deadline in simple language' },
  { step: '02', title: 'AI Plans It Out', description: 'AI splits your goal into prioritized tasks' },
  { step: '03', title: 'Execute & Track', description: 'Follow the schedule with real-time guidance' },
  { step: '04', title: 'Achieve Success', description: 'Complete your goal before the deadline' },
]

const testimonials = [
  { name: 'Alex Chen', role: 'Startup Founder', content: 'Last-Minute Life Saver helped me launch my MVP in 30 days instead of 3 months. Game changer!' },
  { name: 'Sarah Miller', role: 'Graduate Student', content: 'Managed to write my entire thesis before the deadline. The AI scheduling is incredibly smart.' },
  { name: 'David Park', role: 'Product Manager', content: 'Our team productivity increased by 40%. No more missed deadlines or forgotten tasks.' },
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <GlassCard className="text-center h-full">
                    <div className="p-6">
                      <div className="text-5xl font-bold bg-gradient-to-r from-violet-500/20 to-cyan-500/20 bg-clip-text text-transparent mb-4">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm">{step.description}</p>
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
                      <div>
                        <div className="font-medium text-white text-sm">{testimonial.name}</div>
                        <div className="text-slate-500 text-xs">{testimonial.role}</div>
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
          <div className="max-w-4xl mx-auto">
            <GlassCard>
              <div className="p-8 lg:p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    Ready to rescue your deadlines?
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Join 50,000+ users who have transformed their productivity with AI-powered task management.
                  </p>
                  <AnimatedButton
                    variant="gradient"
                    size="lg"
                    icon={<ArrowRight className="w-5 h-5" />}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started Free
                  </AnimatedButton>
                </motion.div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">LifeSaver</span>
              </div>
              <div className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Last-Minute Life Saver. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
