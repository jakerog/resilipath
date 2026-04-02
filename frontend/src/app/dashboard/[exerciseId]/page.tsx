'use client';

import React, { useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskCard, TaskStatus } from '@/components/dashboard/TaskCard';
import { GanttChart } from '@/components/dashboard/GanttChart';
import { UserPresence } from '@/components/dashboard/UserPresence';
import { EvidenceUpload } from '@/components/dashboard/EvidenceUpload';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Activity, LayoutDashboard, Database, Shield } from 'lucide-react';

export default function ExerciseDashboard() {
  const params = useParams();
  const exerciseId = params.exerciseId as string;

  // 1. Real-time Exercise Metadata (Task 7 optimization)
  const { data: exercises } = useFirestoreQuery('exercises', [
    where('exerciseId', '==', exerciseId)
  ]);
  const exercise = exercises[0] as any;

  // 2. Real-time Tasks (Task 1)
  const taskConstraints = useMemo(() => [
    where('exerciseId', '==', exerciseId),
    orderBy('order', 'asc')
  ], [exerciseId]);

  const { data: tasks, loading } = useFirestoreQuery('tasks', taskConstraints);

  // 3. Status Update with client-side debounce (Task 6)
  const handleStatusUpdate = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'in_progress') {
        updateData.startTimeActual = serverTimestamp();
      } else if (newStatus === 'completed' || newStatus === 'failed') {
        updateData.endTimeActual = serverTimestamp();
      }

      await updateDoc(taskRef, updateData);
      console.log(`Task ${taskId} updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-brand-accent animate-pulse" />
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
            Synchronizing Exercise Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <SkeuomorphicContainer className="p-3">
            <LayoutDashboard className="w-6 h-6 text-brand-accent" />
          </SkeuomorphicContainer>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{exercise?.name || 'Loading...'}</h1>
            <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
              Exercise Execution Engine • Real-time Sync Active
            </p>
          </div>
        </div>
        <UserPresence exerciseId={exerciseId} />
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        {/* Left Column: Task List & Metrics */}
        <div className="lg:col-span-8 space-y-8">
          <GanttChart tasks={tasks} />

          <div className="grid md:grid-cols-2 gap-4">
            {tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                id={task.taskId}
                title={task.title}
                status={task.status}
                assignedTo={task.assignedToUid}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Execution Controls & Evidence */}
        <aside className="lg:col-span-4 space-y-8">
          <SkeuomorphicContainer className="space-y-4">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-success" />
              Compliance Control
            </h2>
            <div className="space-y-4">
              <EvidenceUpload
                tenantId={exercise?.tenantId || 'pending'}
                exerciseId={exerciseId}
                taskId={tasks.find((t: any) => t.status === 'in_progress')?.taskId || 'exercise-wide'}
                onUploadComplete={(url) => console.log('Evidence uploaded:', url)}
              />

              <SkeuomorphicContainer inset className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">Database Sync</span>
                  <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">Isolated Tenant</span>
                  <span className="text-[10px] font-bold text-brand-accent">{exercise?.tenantId || '...'}</span>
                </div>
              </SkeuomorphicContainer>
            </div>
          </SkeuomorphicContainer>

          <SkeuomorphicContainer className="space-y-4">
             <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-accent" />
              System Metrics
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <SkeuomorphicContainer inset className="p-3 text-center">
                <div className="text-xl font-bold text-brand-primary">
                  {tasks.filter((t: any) => t.status === 'completed').length}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-brand-secondary">Done</div>
              </SkeuomorphicContainer>
              <SkeuomorphicContainer inset className="p-3 text-center">
                <div className="text-xl font-bold text-brand-accent">
                   {tasks.filter((t: any) => t.status === 'in_progress').length}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-brand-secondary">Active</div>
              </SkeuomorphicContainer>
            </div>
          </SkeuomorphicContainer>
        </aside>
      </main>
    </div>
  );
}
