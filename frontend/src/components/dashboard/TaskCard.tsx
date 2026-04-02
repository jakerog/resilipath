import React from 'react';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { CheckCircle2, Clock, Play, SkipForward, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

interface TaskCardProps {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  startTime?: Date;
  endTime?: Date;
  onStatusUpdate: (id: string, status: TaskStatus) => void;
}

const statusIcons = {
  pending: Clock,
  in_progress: Play,
  completed: CheckCircle2,
  failed: AlertCircle,
  skipped: SkipForward,
};

const statusColors = {
  pending: 'text-brand-secondary',
  in_progress: 'text-brand-accent',
  completed: 'text-brand-success',
  failed: 'text-brand-danger',
  skipped: 'text-gray-400',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  status,
  assignedTo,
  startTime,
  endTime,
  onStatusUpdate
}) => {
  const Icon = statusIcons[status];

  return (
    <SkeuomorphicContainer className="hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-brand-primary">{title}</h3>
          <p className="text-xs text-brand-secondary font-medium uppercase tracking-wider">
            ID: {id}
          </p>
          {assignedTo && (
            <p className="text-xs text-brand-secondary flex items-center gap-1">
              <span className="opacity-60">Assigned:</span> {assignedTo}
            </p>
          )}
        </div>
        <div className={clsx("p-2 rounded-full neumorphic-inset", statusColors[status])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-brand-secondary/10 flex gap-2">
        {status === 'pending' && (
          <button
            onClick={() => onStatusUpdate(id, 'in_progress')}
            className="neumorphic-button px-3 py-1 text-xs font-bold text-brand-accent flex-1"
          >
            Start
          </button>
        )}
        {status === 'in_progress' && (
          <button
            onClick={() => onStatusUpdate(id, 'completed')}
            className="neumorphic-button px-3 py-1 text-xs font-bold text-brand-success flex-1"
          >
            Complete
          </button>
        )}
        {(status === 'pending' || status === 'in_progress') && (
          <button
            onClick={() => onStatusUpdate(id, 'skipped')}
            className="neumorphic-button px-3 py-1 text-xs font-bold text-gray-400"
          >
            Skip
          </button>
        )}
      </div>
    </SkeuomorphicContainer>
  );
};
