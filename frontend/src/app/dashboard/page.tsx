'use client';

import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Activity, LayoutDashboard, Calendar, ChevronRight, PlayCircle, Clock, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export default function ExerciseGallery() {
  const router = useRouter();
  const { tenantId, user, loading: authLoading } = useAuth();

  // 1. Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2. Fetch tenant exercises
  const exerciseConstraints = useMemo(() => {
    if (!tenantId) return [];
    return [
      where('tenantId', '==', tenantId),
      orderBy('startTimeEstimated', 'desc')
    ];
  }, [tenantId]);

  const { data: exercises, loading: exercisesLoading } = useFirestoreQuery('exercises', exerciseConstraints);

  const loading = authLoading || exercisesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-brand-accent animate-pulse" />
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
            Loading Exercise Registry...
          </p>
        </div>
      </div>
    );
  }

  // Final check to prevent flash of content before redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <Lock className="w-10 h-10 text-brand-danger animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-10 flex items-center gap-4">
        <SkeuomorphicContainer className="p-3">
          <LayoutDashboard className="w-8 h-8 text-brand-accent" />
        </SkeuomorphicContainer>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Exercise Control Center</h1>
          <p className="text-xs text-brand-secondary font-medium uppercase tracking-widest opacity-60">
            Active and Scheduled Resilience Operations
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {exercises.length === 0 ? (
          <SkeuomorphicContainer className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 neumorphic-inset rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-brand-secondary opacity-30" />
            </div>
            <p className="text-sm text-brand-secondary font-medium">No resilience exercises found for your tenant.</p>
            <p className="text-xs text-brand-secondary opacity-60 max-w-md mx-auto">
              Please use the Resilience Planning module to draft and schedule a new exercise from a BCP template.
            </p>
          </SkeuomorphicContainer>
        ) : (
          <div className="grid gap-6">
            {exercises.map((exercise: any) => (
              <SkeuomorphicContainer
                key={exercise.id}
                className="p-6 cursor-pointer hover:scale-[1.01] transition-transform group"
                onClick={() => router.push(`/dashboard/${exercise.exerciseId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl neumorphic-inset flex items-center justify-center transition-colors",
                      exercise.status === 'active' ? "text-brand-success bg-brand-success/5" : "text-brand-secondary"
                    )}>
                      {exercise.status === 'active' ? (
                        <PlayCircle className="w-6 h-6 animate-pulse" />
                      ) : (
                        <Calendar className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-brand-primary">{exercise.name}</h3>
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                          exercise.status === 'active' ? "bg-brand-success/10 text-brand-success" : "bg-brand-secondary/10 text-brand-secondary"
                        )}>
                          {exercise.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-brand-secondary opacity-60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Est. Duration: {exercise.durationEstimatedMinutes}m
                        </span>
                        <span>Phase: {exercise.phase}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest opacity-40">Scheduled For</p>
                      <p className="text-xs font-bold text-brand-primary">
                        {exercise.startTimeEstimated?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
                  </div>
                </div>
              </SkeuomorphicContainer>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
