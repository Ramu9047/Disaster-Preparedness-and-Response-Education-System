import { useEffect, useRef } from 'react';
import { useDisasterData } from '../context/DisasterDataContext';

/**
 * EscalationEngine — Invisible background component.
 * Runs every 60s and checks all IN_PROGRESS tasks whose escalateAt deadline has passed.
 * Automatically transitions overdue tasks to ESCALATED status and triggers an alert.
 */
export default function EscalationEngine() {
    const { tasks, alerts, updateTask, addAlert, TASK_STATUS } = useDisasterData();
    const tasksRef = useRef(tasks);
    const alertsRef = useRef(alerts);

    // Keep refs in sync with latest state (avoids stale closure in interval)
    useEffect(() => { tasksRef.current = tasks; }, [tasks]);
    useEffect(() => { alertsRef.current = alerts; }, [alerts]);

    useEffect(() => {
        const run = () => {
            const now = new Date();
            tasksRef.current.forEach(task => {
                const isOverdue = new Date(task.escalateAt) < now;
                if (isOverdue && task.status === TASK_STATUS.IN_PROGRESS) {
                    // Mark task as ESCALATED
                    updateTask(task.id, { status: TASK_STATUS.ESCALATED });

                    // Fire escalation alert (only if not already fired for this task)
                    const alreadyFired = alertsRef.current.some(a => a.escalatedTaskId === task.id);
                    if (!alreadyFired) {
                        addAlert({
                            type: 'HIGH',
                            title: `⚠️ ESCALATION: ${task.title}`,
                            message: `Task "${task.title}" has exceeded its deadline and has been automatically escalated. Immediate action required by senior authority.`,
                            escalatedTaskId: task.id,
                        });
                    }
                }

                // Also escalate PENDING tasks that are more than 3× overdue
                const isLongOverdue = new Date(task.escalateAt) < new Date(now - 3 * 60 * 60000); // 3hr past
                if (isLongOverdue && task.status === TASK_STATUS.PENDING) {
                    updateTask(task.id, { status: TASK_STATUS.ESCALATED });
                    const alreadyFired = alertsRef.current.some(a => a.escalatedTaskId === task.id);
                    if (!alreadyFired) {
                        addAlert({
                            type: 'CRITICAL',
                            title: `🚨 CRITICAL ESCALATION: ${task.title}`,
                            message: `Task "${task.title}" was never started and is critically overdue. Escalated to District Collector level.`,
                            escalatedTaskId: task.id,
                        });
                    }
                }
            });
        };

        run(); // Run immediately once on mount
        const interval = setInterval(run, 60000); // Then every 60 seconds
        return () => clearInterval(interval);
    }, [updateTask, addAlert, TASK_STATUS]);

    return null; // This component renders nothing
}
