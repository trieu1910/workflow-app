import { useState, useEffect, useMemo } from 'react';
import { X, Play, Check, Clock, SkipForward } from 'lucide-react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { getRandomExercises, getTotalDuration } from '../data/exercises';

export default function BreakReminder() {
    const { showBreakModal, recordBreakTaken, skipBreak, breakReminder } = useNotificationStore();
    const [currentExercise, setCurrentExercise] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [completed, setCompleted] = useState([]);

    // Get random exercises when modal opens
    const exercises = useMemo(() => getRandomExercises(3), [showBreakModal]);
    const totalDuration = useMemo(() => getTotalDuration(exercises), [exercises]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer(t => t - 1);
            }, 1000);
        } else if (timer === 0 && isRunning) {
            setIsRunning(false);
            // Mark current exercise as completed
            if (!completed.includes(currentExercise)) {
                setCompleted([...completed, currentExercise]);
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timer, currentExercise, completed]);

    // Reset when modal opens
    useEffect(() => {
        if (showBreakModal) {
            setCurrentExercise(0);
            setTimer(0);
            setIsRunning(false);
            setCompleted([]);
        }
    }, [showBreakModal]);

    if (!showBreakModal) return null;

    const handleStartExercise = (index) => {
        setCurrentExercise(index);
        setTimer(exercises[index].duration);
        setIsRunning(true);
    };

    const handleComplete = () => {
        recordBreakTaken();
    };

    const handleSkip = () => {
        skipBreak();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="break-modal-overlay">
            <div className="break-modal">
                <div className="break-header">
                    <div className="break-title">
                        <span className="break-emoji">🧘</span>
                        <div>
                            <h2>Thời gian nghỉ ngơi!</h2>
                            <p>Bạn đã làm việc {breakReminder.intervalMinutes} phút. Hãy nghỉ ngơi ~{totalDuration} phút.</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        <X size={20} />
                    </button>
                </div>

                <div className="exercises-list">
                    {exercises.map((exercise, index) => (
                        <div
                            key={exercise.id}
                            className={`exercise-item ${currentExercise === index && isRunning ? 'active' : ''} ${completed.includes(index) ? 'completed' : ''}`}
                        >
                            <span className="exercise-icon">{exercise.icon}</span>
                            <div className="exercise-info">
                                <h4>{exercise.title}</h4>
                                <p>{exercise.description}</p>
                            </div>
                            <div className="exercise-action">
                                {completed.includes(index) ? (
                                    <span className="completed-badge"><Check size={16} /> Xong</span>
                                ) : currentExercise === index && isRunning ? (
                                    <div className="timer-display">
                                        <Clock size={16} />
                                        <span>{formatTime(timer)}</span>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleStartExercise(index)}
                                    >
                                        <Play size={14} /> Bắt đầu
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="break-footer">
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        <SkipForward size={16} /> Bỏ qua (nhắc sau 10 phút)
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleComplete}
                    >
                        <Check size={16} /> Đã nghỉ xong
                    </button>
                </div>
            </div>

            <style>{`
                .break-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .break-modal {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .break-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: var(--spacing-lg);
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
                    border-bottom: 1px solid var(--border-color);
                }

                .break-title {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-md);
                }

                .break-emoji {
                    font-size: 2.5rem;
                }

                .break-title h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--text-primary);
                }

                .break-title p {
                    margin: var(--spacing-xs) 0 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .exercises-list {
                    padding: var(--spacing-md);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .exercise-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .exercise-item.active {
                    border-color: var(--primary);
                    background: var(--primary-glow);
                }

                .exercise-item.completed {
                    opacity: 0.6;
                }

                .exercise-icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                }

                .exercise-info {
                    flex: 1;
                }

                .exercise-info h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: var(--text-primary);
                }

                .exercise-info p {
                    margin: var(--spacing-xs) 0 0;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .exercise-action {
                    flex-shrink: 0;
                }

                .timer-display {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--primary);
                    font-variant-numeric: tabular-nums;
                }

                .completed-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    color: var(--success);
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .break-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                }

                .break-footer .btn {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }
            `}</style>
        </div>
    );
}
