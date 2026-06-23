import { motion } from 'framer-motion'

export default function FloatingBlobs() {
  const blobs = [
    { size: 80, x: '10%', y: '20%', color: 'from-violet-500/30 to-indigo-500/30', delay: 0 },
    { size: 60, x: '85%', y: '15%', color: 'from-cyan-500/30 to-blue-500/30', delay: 2 },
    { size: 100, x: '75%', y: '70%', color: 'from-purple-500/20 to-pink-500/20', delay: 4 },
    { size: 50, x: '20%', y: '80%', color: 'from-indigo-500/30 to-blue-500/30', delay: 1 },
    { size: 70, x: '50%', y: '40%', color: 'from-cyan-500/20 to-teal-500/20', delay: 3 },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${blob.color} backdrop-blur-3xl`}
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            filter: 'blur(30px)',
          }}
          animate={{
            y: [0, -30, 30, 0],
            x: [0, 20, -20, 0],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  )
}
