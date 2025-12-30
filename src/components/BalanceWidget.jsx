import { useMemo } from 'react';
import { Heart, Battery, Brain, Smile, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useWellbeingStore, ENERGY_LEVELS, MOOD_LEVELS } from '../stores/useWellbeingStore';
import { useStatsStore } from '../stores/useStatsStore';
import { useHabitStore } from '../stores/useHabitStore';

export default function BalanceWidget({ onOpenCheckIn }) {
    const { getTodayCheckIn, getBalanceScore } = useWellbeingStore();
    const { focusTimeToday } = useStatsStore();
    const { habits, checkIns } = useHabitStore();

    const today = new Date().toISOString().split('T')[0];
    const todayCheckIn = getTodayCheckIn();

    // Calculate habit stats
    const habitStats = useMemo(() => {
        const activeHabits = habits.filter(h => h.active);
        const completed = activeHabits.filter(h => checkIns[h.id]?.[today]).length;
        return { completed, total: activeHabits.length };
    }, [habits, checkIns, today]);

    // Get balance score
    const balance = useMemo(() => {
        return getBalanceScore(
            { focusTimeToday },
            habitStats
        );
    }, [getBalanceScore, focusTimeToday, habitStats]);

    const energyLevel = todayCheckIn?.energy;
    const moodLevel = todayCheckIn?.mood;
    const energyInfo = energyLevel ? ENERGY_LEVELS[energyLevel] : null;
    const moodInfo = moodLevel ? MOOD_LEVELS[moodLevel] : null;

    // Determine ring color based on score
    const getRingStyle = () => {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (balance.score / 100) * circumference;
        return {
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            stroke: balance.statusColor,
        };
    };

    return (
        <div className="balance-widget">
            <div className="balance-header">
                <Heart size={18} />
                <h3>Work-Life Balance</h3>
            </div>

            <div className="balance-content">
                {/* Circular Score */}
                <div className="balance-ring-container">
                    <svg className="balance-ring" viewBox="0 0 100 100">
                        <circle
                            className="ring-bg"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                        />
                        <circle
                            className="ring-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={getRingStyle()}
                        />
                    </svg>
                    <div className="balance-score-text">
                        <span className="score-value">{balance.score}</span>
                        <span className="score-label">{balance.statusLabel}</span>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="balance-stats">
                    <div
                        className={`balance-stat ${!energyInfo ? 'empty' : ''}`}
                        onClick={onOpenCheckIn}
                        title="Click để check-in"
                    >
                        <Battery size={18} style={{ color: energyInfo?.color || 'gray' }} />
                        <span>{energyInfo ? energyInfo.label : 'Check-in'}</span>
                    </div>
                    <div
                        className={`balance-stat ${!moodInfo ? 'empty' : ''}`}
                        onClick={onOpenCheckIn}
                        title="Click để check-in"
                    >
                        <Smile size={18} style={{ color: moodInfo?.color || 'gray' }} />
                        <span>{moodInfo ? moodInfo.label : 'Mood?'}</span>
                    </div>
                    <div className="balance-stat">
                        <TrendingUp size={18} className="text-blue-500" />
                        <span>{habitStats.completed}/{habitStats.total} Habits</span>
                    </div>
                </div>

                {/* Smart Suggestion based on Energy */}
                {energyLevel && (
                    <div className={`balance-suggestion ${energyLevel <= 2 ? 'warning' : energyLevel >= 4 ? 'success' : ''}`}>
                        {energyLevel <= 2 ? (
                            <>
                                <AlertTriangle size={16} />
                                <span>Năng lượng thấp - Hãy làm task nhỏ hoặc nghỉ ngơi</span>
                            </>
                        ) : energyLevel >= 4 ? (
                            <>
                                <CheckCircle size={16} />
                                <span>Năng lượng cao - Thời điểm tốt để "Eat the Frog"!</span>
                            </>
                        ) : (
                            <>
                                <Brain size={16} />
                                <span>Năng lượng ổn định - Duy trì nhịp độ làm việc</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .balance-widget {
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    padding: var(--space-5);
                }

                .balance-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    margin-bottom: var(--space-4);
                    color: var(--text-secondary);
                }

                .balance-header h3 {
                    font-size: var(--text-sm);
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-primary);
                }

                .balance-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-4);
                }

                .balance-ring-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }

                .balance-ring {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .ring-bg {
                    stroke: var(--bg-hover);
                }

                .ring-progress {
                    transition: stroke-dashoffset 0.5s ease;
                }

                .balance-score-text {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .score-value {
                    font-size: var(--text-2xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                }

                .score-label {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
                    margin-top: var(--space-1);
                }

                .balance-stats {
                    display: flex;
                    gap: var(--space-2);
                    flex-wrap: wrap;
                    justify-content: center;
                    width: 100%;
                }

                .balance-stat {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-2) var(--space-3);
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    font-size: var(--text-xs);
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .balance-stat:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .balance-stat.empty {
                    border: 1px dashed var(--border-default);
                    background: transparent;
                }

                .balance-suggestion {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: var(--text-xs);
                    font-weight: 500;
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    width: 100%;
                    line-height: 1.4;
                }

                .balance-suggestion.warning {
                    background: var(--danger-muted);
                    color: var(--danger);
                }

                .balance-suggestion.success {
                    background: var(--success-muted);
                    color: var(--success);
                }
            `}</style>
        </div>
    );
}
