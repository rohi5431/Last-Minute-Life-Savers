import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DemoBanner from '../components/DemoBanner'
import { TaskProvider } from '../context/TaskContext'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <TaskProvider>
      <div className="flex min-h-screen bg-ink-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            sidebarOpen={sidebarOpen}
          />
          <DemoBanner />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TaskProvider>
  )
}
