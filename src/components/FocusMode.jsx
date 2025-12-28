import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, CheckCircle, Clock, Zap } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { useStatsStore, getTaskXP } from '../stores/useStatsStore';
import { formatEstimatedTime } from '../utils/smartParser';

export default function FocusMode({ task, onClose }) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const intervalRef = useRef(null);

    const completeTask = useTaskStore((state) => state.completeTask);
    const { addXP, addFocusTime } = useStatsStore();

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

        // Add focus time
        addFocusTime(elapsedSeconds);

        // Complete task and add XP
        const actualMinutes = Math.round(elapsedSeconds / 60);
        completeTask(task.id, actualMinutes);

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
        if (elapsedSeconds > 0) {
            addFocusTime(elapsedSeconds);
        }
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
      `}</style>
        </div>
    );
}
