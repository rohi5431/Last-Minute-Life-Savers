import { ListTodo } from 'lucide-react'
import TaskBoard from '../components/TaskBoard'

export default function Tasks() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">Tasks</h1>
        </div>
        <p className="text-sm text-ink-500 mt-1">
          Everything the AI planned for you, grouped and ready to advance.
        </p>
      </div>
      <TaskBoard />
    </div>
  )
}
