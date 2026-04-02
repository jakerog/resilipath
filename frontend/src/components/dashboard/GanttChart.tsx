import React, { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import { format } from 'date-fns';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';

interface GanttChartProps {
  tasks: any[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const ganttRef = useRef<SVGSVGElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (tasks.length > 0 && ganttRef.current) {
      const formattedTasks = tasks.map(task => ({
        id: task.id,
        name: task.title,
        start: format(task.startTimeActual?.toDate() || new Date(), 'yyyy-MM-dd'),
        end: format(task.endTimeActual?.toDate() || new Date(), 'yyyy-MM-dd'),
        progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
        dependencies: task.dependsOn?.join(', ') || ''
      }));

      if (!chartInstance.current) {
        chartInstance.current = new Gantt(ganttRef.current, formattedTasks, {
          header_height: 50,
          column_width: 30,
          step: 24,
          view_modes: ['Day', 'Week', 'Month'],
          view_mode: 'Day',
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          date_format: 'YYYY-MM-DD',
          custom_popup_html: null
        });
      } else {
        chartInstance.current.refresh(formattedTasks);
      }
    }
  }, [tasks]);

  return (
    <SkeuomorphicContainer className="overflow-hidden p-0">
      <div className="p-4 border-b border-brand-secondary/10 bg-brand-primary/5">
        <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider flex items-center gap-2">
          Exercise Timeline
        </h2>
      </div>
      <div className="overflow-x-auto p-4 bg-white/50">
        <svg ref={ganttRef} className="w-full h-auto min-h-[200px]" />
      </div>
    </SkeuomorphicContainer>
  );
};
