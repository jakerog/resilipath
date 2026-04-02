/**
 * ResiliPath - Orchestration Engine Types
 * Follows Modular Design & Single-Concern Principle (Orchestration).
 */

/**
 * Task State Transitions (Task 3 / M8)
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * Go/No-Go Decision Status (Task 6 / M8)
 */
export type DecisionStatus = 'GO' | 'NO_GO' | 'PENDING';

/**
 * DAG Validation Result (Task 1)
 */
export interface DagValidationResult {
  isValid: boolean;
  error?: string;
  cycle?: string[]; // Array of task IDs in a detected cycle
}
