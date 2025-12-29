import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Play, Pause, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import { useStatsStore, getTaskXP } from '../stores/useStatsStore';
import { formatEstimatedTime } from '../utils/smartParser';

export default function FocusMode({ task, onClose }) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(task.timeSpent || 0);
    const initialSecondsRef = useRef(task.timeSpent || 0);
    const [showComplete, setShowComplete] = useState(false);
    const intervalRef = useRef(null);

    const completeTask = useTaskStore((state) => state.completeTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const { addXP, addFocusTime } = useStatsStore();
    const { goals, milestones, getMilestonesByGoal } = useGoalStore();
    const tasks = useTaskStore((state) => state.tasks);

    // ... (rest of imports) since I'm blocking out lines 8-18 and replacing up to existing usage
    // Wait, I need to match the replacement block carefully.

    // Get goal context for current task
    const goalContext = useMemo(() => {
        // ... (lines 20-47 in original, will remain if I start replacement earlier or handle it right)
        // I will replace lines 8-119 actually to cover handleExit and imports
        if (!task) return null;

        let goalId = task.goalId;
        let milestone = null;

        if (task.milestoneId) {
            milestone = milestones.find(m => m.id === task.milestoneId);
            goalId = milestone?.goalId || goalId;
        }

        const goal = goals.find(g => g.id === goalId);
        if (!goal) return null;

        const area = LIFE_AREAS[goal.area];

        // Calculate milestone progress
        let milestoneProgress = 0;
        if (milestone) {
            const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id);
            const completed = milestoneTasks.filter(t => t.completed).length;
            milestoneProgress = milestoneTasks.length > 0
                ? Math.round((completed / milestoneTasks.length) * 100)
                : 0;
        }

        return { goal, area, milestone, milestoneProgress };
    }, [task, goals, milestones, tasks]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedSeconds((s) => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        // Save progress every 30 seconds
        if (isRunning && elapsedSeconds > 0 && elapsedSeconds % 30 === 0) {
            updateTask(task.id, { timeSpent: elapsedSeconds });
        }
    }, [elapsedSeconds, isRunning, task.id, updateTask]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleExit();
            } else if (e.key === ' ') {
                e.preventDefault();
                setIsRunning((r) => !r);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        setIsRunning(false);

        // Add focus time (only the session delta)
        const sessionDelta = elapsedSeconds - initialSecondsRef.current;
        if (sessionDelta > 0) {
            addFocusTime(sessionDelta);
        }

        // Complete task and add XP
        const actualMinutes = Math.round(elapsedSeconds / 60);
        completeTask(task.id, actualMinutes);

        // Ensure timeSpent is saved (optional, but good for record)
        updateTask(task.id, { timeSpent: elapsedSeconds });

        const xp = getTaskXP(task.priority);
        addXP(xp);

        setShowComplete(true);

        // Close after animation
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    const handleExit = () => {
        setIsRunning(false);

        // Add focus time (only the session delta)
        const sessionDelta = elapsedSeconds - initialSecondsRef.current;
        if (sessionDelta > 0) {
            addFocusTime(sessionDelta);
        }

        // Save total progress to task
        updateTask(task.id, { timeSpent: elapsedSeconds });

        onClose();
    };

    if (!task) return null;

    if (showComplete) {
        return (
            <div className="focus-mode">
                <div className="focus-complete-animation">
                    <CheckCircle size={80} className="check-icon" />
                    <h2>Hoàn thành!</h2>
                    <p>+{getTaskXP(task.priority)} XP</p>
                    {goalContext && (
                        <div className="goal-contribution">
                            <Target size={16} />
                            Đóng góp vào: {goalContext.area?.icon} {goalContext.goal.title}
                        </div>
                    )}
                </div>

                <style>{`
          .focus-complete-animation {
            text-align: center;
            animation: scaleIn 0.5s ease;
          }
          
          .check-icon {
            color: var(--success);
            margin-bottom: var(--spacing-md);
            animation: pulse 1s ease infinite;
          }
          
          .focus-complete-animation h2 {
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
            background: linear-gradient(135deg, var(--success), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .focus-complete-animation p {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
          }

          .goal-contribution {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            margin-top: var(--spacing-md);
            color: var(--text-secondary);
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="focus-mode">
            <button className="focus-mode-exit btn btn-ghost" onClick={handleExit}>
                <X size={24} />
            </button>

            <div className="focus-mode-content">
                {/* Goal Context Banner */}
                {goalContext && (
                    <div className="focus-goal-context" style={{ '--goal-color': goalContext.area?.color }}>
                        <div className="goal-info">
                            <Target size={16} />
                            <span>{goalContext.area?.icon} {goalContext.goal.title}</span>
                        </div>
                        {goalContext.milestone && (
                            <div className="milestone-progress">
                                <span>🏁 {goalContext.milestone.title}</span>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${goalContext.milestoneProgress}%` }} />
                                </div>
                                <span>{goalContext.milestoneProgress}%</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Timer */}
                <div className="focus-mode-timer">
                    {formatTime(elapsedSeconds)}
                </div>

                {/* Task Info */}
                <h2 className="focus-mode-task">{task.title}</h2>

                <div className="focus-mode-meta">
                    {task.estimatedMinutes && (
                        <span>
                            <Clock size={16} />
                            Dự kiến: {formatEstimatedTime(task.estimatedMinutes)}
                        </span>
                    )}
                    <span className={`priority-badge priority-${task.priority}`}>
                        <Zap size={12} />
                        {task.priority === 'high' ? 'Cao' :
                            task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                </div>

                {/* Controls */}
                <div className="focus-mode-controls">
                    <button
                        className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'} focus-btn`}
                        onClick={() => setIsRunning(!isRunning)}
                    >
                        {isRunning ? <Pause size={24} /> : <Play size={24} />}
                        <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
                    </button>

                    <button
                        className="btn btn-primary focus-btn complete-btn"
                        onClick={handleComplete}
                    >
                        <CheckCircle size={24} />
                        <span>Hoàn thành</span>
                    </button>
                </div>

                {/* Keyboard hints */}
                <div className="focus-hints">
                    <kbd>Space</kbd> để bắt đầu/dừng • <kbd>Esc</kbd> để thoát
                </div>
            </div>

            <style>{`
        .focus-mode-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-2xl);
        }
        
        .focus-mode-meta span {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .focus-btn {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: 1.1rem;
        }
        
        .focus-btn svg {
          width: 24px;
          height: 24px;
        }
        
        .complete-btn {
          background: linear-gradient(135deg, var(--success), #16a34a);
        }
        
        .complete-btn:hover {
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
        }
        
        .focus-hints {
          margin-top: var(--spacing-2xl);
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .focus-hints kbd {
          display: inline-block;
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: monospace;
          margin: 0 4px;
        }

        .focus-goal-context {
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-md);
          background: color-mix(in srgb, var(--goal-color, var(--primary)) 15%, transparent);
          border: 1px solid var(--goal-color, var(--primary));
          border-radius: var(--radius-lg);
        }

        .focus-goal-context .goal-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          color: var(--goal-color, var(--primary));
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
        }

        .milestone-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .milestone-progress .progress-bar {
          width: 100px;
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .milestone-progress .progress-fill {
          height: 100%;
          background: var(--goal-color, var(--success));
          border-radius: var(--radius-full);
        }
      `}</style>
        </div>
    );
}
