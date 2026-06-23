import { useEffect } from 'react';
import { Target, Calendar, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Goals() {
  const { goals, fetchGoals, deleteGoal, loading } = useTasks();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Your Goals</h1>
        <p className="text-slate-400">Track and manage your deadlines</p>
      </div>

      {loading && goals.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400">No goals yet</p>
          <p className="text-slate-500 text-sm">Create your first goal from the dashboard</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-lg font-medium text-white">{goal.title}</h3>
                  </div>

                  {goal.description && (
                    <p className="text-slate-400 text-sm mb-3">{goal.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(goal.deadline)}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        goal.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : goal.status === 'completed'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
