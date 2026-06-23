import { useEffect } from 'react';
import Timeline from '../components/Timeline';
import { useTasks } from '../context/TaskContext';

export default function Schedule() {
  const { fetchSchedule } = useTasks();

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Schedule</h1>
        <p className="text-slate-400">View your planned tasks and timeline</p>
      </div>
      <Timeline />
    </div>
  );
}
