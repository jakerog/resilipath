/**
 * DAG Validation & Logic for ResiliPath
 * Implements dependency checking and status propagation.
 */

import { DagValidationResult } from './types';
import { ExerciseTask } from '../models/schema';

/**
 * Task 1: Core Directed Acyclic Graph (DAG) Validation
 * Detects circular dependencies in a task list.
 */
export function validateTaskDependencies(tasks: ExerciseTask[]): DagValidationResult {
  const adj = new Map<string, string[]>();
  tasks.forEach(task => {
    adj.set(task.taskId, task.dependsOn || []);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(taskId: string, stack: string[]): string[] | null {
    if (recStack.has(taskId)) {
      const cycleStart = stack.indexOf(taskId);
      return [...stack.slice(cycleStart), taskId];
    }
    if (visited.has(taskId)) return null;

    visited.add(taskId);
    recStack.add(taskId);
    stack.push(taskId);

    const neighbors = adj.get(taskId) || [];
    for (const neighbor of neighbors) {
      const cycle = hasCycle(neighbor, stack);
      if (cycle) return cycle;
    }

    recStack.delete(taskId);
    stack.pop();
    return null;
  }

  for (const task of tasks) {
    const cycle = hasCycle(task.taskId, []);
    if (cycle) {
      return {
        isValid: false,
        error: `Circular dependency detected: ${cycle.join(' -> ')}`,
        cycle,
      };
    }
  }

  return { isValid: true };
}

/**
 * Task 2 Readiness Check
 * Checks if a task is ready to start based on its dependencies.
 */
export function isTaskReady(task: ExerciseTask, allTasks: ExerciseTask[]): boolean {
  if (!task.dependsOn || task.dependsOn.length === 0) return true;

  const dependencies = allTasks.filter(t => task.dependsOn?.includes(t.taskId));
  return dependencies.every(t => t.status === 'completed' || t.status === 'skipped');
}
