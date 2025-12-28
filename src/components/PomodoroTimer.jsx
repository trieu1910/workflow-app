import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Coffee, Zap } from 'lucide-react';

const DEFAULT_SETTINGS = {
    workDuration: 25, // minutes
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
};

const TIMER_STATES = {
    IDLE: 'idle',
    WORK: 'work',
    SHORT_BREAK: 'shortBreak',
    LONG_BREAK: 'longBreak',
};

export default function PomodoroTimer({ task, onComplete, onClose }) {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('workflow-pomodoro-settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [showSettings, setShowSettings] = useState(false);
    const [timerState, setTimerState] = useState(TIMER_STATES.IDLE);
    const [timeRemaining, setTimeRemaining] = useState(settings.workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    // Create audio element
    useEffect(() => {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleU0lfX3Cv4OFdGFXaIaXn4xoOiU/bqO+w6V7VDI/apu9y7F8TiooWIu3z8KZa0MxMFaIuM/DoXlOMTBYjLfRwp97UDAwV4u30cOfe1AwMFeLt9HDn3tQMDBXi7fRw597UDAwV4u30cOfe1AwMFeLt9HDn3tQMA==');
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem('workflow-pomodoro-settings', JSON.stringify(settings));
    }, [settings]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((t) => t - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            handleTimerComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeRemaining]);

    const playSound = () => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => { });
        }
    };

    const handleTimerComplete = () => {
        setIsRunning(false);
        playSound();

        if (timerState === TIMER_STATES.WORK) {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);

            // Check if it's time for a long break
            if (newSessions % settings.sessionsBeforeLongBreak === 0) {
                setTimerState(TIMER_STATES.LONG_BREAK);
                setTimeRemaining(settings.longBreakDuration * 60);
            } else {
                setTimerState(TIMER_STATES.SHORT_BREAK);
                setTimeRemaining(settings.shortBreakDuration * 60);
            }

            // Auto-start break
            setTimeout(() => setIsRunning(true), 1000);
        } else {
            // Break complete, back to work
            setTimerState(TIMER_STATES.WORK);
            setTimeRemaining(settings.workDuration * 60);
        }
    };

    const startTimer = () => {
        if (timerState === TIMER_STATES.IDLE) {
            setTimerState(TIMER_STATES.WORK);
            setTimeRemaining(settings.workDuration * 60);
        }
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimerState(TIMER_STATES.IDLE);
        setTimeRemaining(settings.workDuration * 60);
    };

    const handleComplete = () => {
        if (onComplete) onComplete(sessionsCompleted);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStateLabel = () => {
        switch (timerState) {
            case TIMER_STATES.WORK: return 'Làm việc';
            case TIMER_STATES.SHORT_BREAK: return 'Nghỉ ngắn';
            case TIMER_STATES.LONG_BREAK: return 'Nghỉ dài';
            default: return 'Sẵn sàng';
        }
    };

    const getStateColor = () => {
        switch (timerState) {
            case TIMER_STATES.WORK: return 'var(--primary)';
            case TIMER_STATES.SHORT_BREAK: return 'var(--success)';
            case TIMER_STATES.LONG_BREAK: return 'var(--accent)';
            default: return 'var(--text-muted)';
        }
    };

    const progress = () => {
        let total;
        switch (timerState) {
            case TIMER_STATES.WORK: total = settings.workDuration * 60; break;
            case TIMER_STATES.SHORT_BREAK: total = settings.shortBreakDuration * 60; break;
            case TIMER_STATES.LONG_BREAK: total = settings.longBreakDuration * 60; break;
            default: total = settings.workDuration * 60;
        }
        return ((total - timeRemaining) / total) * 100;
    };

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-header">
                <h3>
                    {timerState === TIMER_STATES.WORK || timerState === TIMER_STATES.IDLE ? (
                        <><Zap size={20} /> Pomodoro</>
                    ) : (
                        <><Coffee size={20} /> Nghỉ ngơi</>
                    )}
                </h3>
                <div className="pomodoro-actions">
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Tắt âm' : 'Bật âm'}
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Cài đặt"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {task && (
                <div className="pomodoro-task">
                    <span className={`priority-dot priority-${task.priority}`} />
                    {task.title}
                </div>
            )}

            {/* Progress Ring */}
            <div className="pomodoro-ring">
                <svg viewBox="0 0 100 100">
                    <circle
                        className="ring-bg"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="6"
                    />
                    <circle
                        className="ring-progress"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        strokeWidth="6"
                        strokeLinecap="round"
                        style={{
                            stroke: getStateColor(),
                            strokeDasharray: `${progress() * 2.83} 283`,
                            transform: 'rotate(-90deg)',
                            transformOrigin: '50% 50%',
                        }}
                    />
                </svg>
                <div className="pomodoro-time">
                    <span className="time-value">{formatTime(timeRemaining)}</span>
                    <span className="time-state" style={{ color: getStateColor() }}>
                        {getStateLabel()}
                    </span>
                </div>
            </div>

            {/* Session Counter */}
            <div className="pomodoro-sessions">
                {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                    <div
                        key={i}
                        className={`session-dot ${i < sessionsCompleted % settings.sessionsBeforeLongBreak ? 'completed' : ''}`}
                    />
                ))}
                <span className="session-count">{sessionsCompleted} phiên</span>
            </div>

            {/* Controls */}
            <div className="pomodoro-controls">
                {!isRunning ? (
                    <button className="btn btn-primary pomodoro-btn" onClick={startTimer}>
                        <Play size={24} />
                        <span>{timerState === TIMER_STATES.IDLE ? 'Bắt đầu' : 'Tiếp tục'}</span>
                    </button>
                ) : (
                    <button className="btn btn-secondary pomodoro-btn" onClick={pauseTimer}>
                        <Pause size={24} />
                        <span>Tạm dừng</span>
                    </button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={resetTimer} title="Reset">
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Complete Task Button */}
            {task && (
                <button className="btn btn-primary complete-task-btn" onClick={handleComplete}>
                    Hoàn thành task
                </button>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="pomodoro-settings">
                    <h4>Cài đặt Pomodoro</h4>
                    <div className="setting-row">
                        <label>Thời gian làm việc</label>
                        <div className="setting-input">
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.workDuration}
                                onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                            />
                            <span>phút</span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <label>Nghỉ ngắn</label>
                        <div className="setting-input">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={settings.shortBreakDuration}
                                onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
                            />
                            <span>phút</span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <label>Nghỉ dài</label>
                        <div className="setting-input">
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.longBreakDuration}
                                onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                            />
                            <span>phút</span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <label>Phiên trước khi nghỉ dài</label>
                        <div className="setting-input">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.sessionsBeforeLongBreak}
                                onChange={(e) => setSettings({ ...settings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                            />
                            <span>phiên</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .pomodoro-container {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          max-width: 320px;
        }
        
        .pomodoro-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }
        
        .pomodoro-header h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 1rem;
          margin: 0;
        }
        
        .pomodoro-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        .pomodoro-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        .pomodoro-ring {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto var(--spacing-lg);
        }
        
        .pomodoro-ring svg {
          width: 100%;
          height: 100%;
        }
        
        .ring-bg {
          stroke: var(--bg-secondary);
        }
        
        .ring-progress {
          transition: stroke-dasharray 0.5s ease;
        }
        
        .pomodoro-time {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .time-value {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }
        
        .time-state {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .pomodoro-sessions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
        }
        
        .session-dot {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          transition: all var(--transition-fast);
        }
        
        .session-dot.completed {
          background: var(--primary);
          border-color: var(--primary);
        }
        
        .session-count {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-left: var(--spacing-sm);
        }
        
        .pomodoro-controls {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .pomodoro-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
        }
        
        .complete-task-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--success), #16a34a);
        }
        
        .complete-task-btn:hover {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
        }
        
        .pomodoro-settings {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
        }
        
        .pomodoro-settings h4 {
          font-size: 0.9rem;
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }
        
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .setting-row label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .setting-input {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .setting-input input {
          width: 60px;
          padding: var(--spacing-xs);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          color: var(--text-primary);
          text-align: center;
        }
        
        .setting-input span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
