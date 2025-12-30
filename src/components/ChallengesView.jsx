import { useState, useEffect } from 'react';
import { Trophy, Clock, Flame, Target, CheckCircle, Lock, ChevronRight, Star, Zap } from 'lucide-react';
import { useChallengeStore, WEEKLY_CHALLENGES } from '../stores/useChallengeStore';
import { useStatsStore } from '../stores/useStatsStore';

export default function ChallengesView() {
    const {
        activeChallenges,
        generateWeeklyChallenges,
        getChallengeStatus,
        getTimeRemaining,
        getStats,
        completedChallenges,
        weekStart
    } = useChallengeStore();

    const { level, xp } = useStatsStore();
    const [challenges, setChallenges] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, expired: false });

    useEffect(() => {
        generateWeeklyChallenges();
        setChallenges(getChallengeStatus());
        setTimeRemaining(getTimeRemaining());
    }, []);

    useEffect(() => {
        setChallenges(getChallengeStatus());
    }, [activeChallenges]);

    // Update time remaining every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(getTimeRemaining());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const stats = getStats();
    const completedThisWeek = challenges.filter(c => c.completed).length;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'hard': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    const getDifficultyLabel = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'Dễ';
            case 'medium': return 'Trung bình';
            case 'hard': return 'Khó';
            default: return difficulty;
        }
    };

    const formatProgress = (challenge) => {
        if (challenge.type === 'focus_time') {
            const hours = Math.floor(challenge.current / 3600);
            const mins = Math.floor((challenge.current % 3600) / 60);
            const targetHours = Math.floor(challenge.target / 3600);
            return `${hours}h ${mins}m / ${targetHours}h`;
        }
        return `${Math.min(challenge.current, challenge.target)} / ${challenge.target}`;
    };

    return (
        <div className="challenges-view">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏆 Thử thách tuần</h1>
                    <p className="page-subtitle">Hoàn thành thử thách để nhận XP bonus!</p>
                </div>
            </div>

            {/* Time Remaining Banner */}
            <div className="time-banner">
                <div className="time-icon">
                    <Clock size={24} />
                </div>
                <div className="time-info">
                    <span className="time-label">Thời gian còn lại</span>
                    <span className="time-value">
                        {timeRemaining.expired
                            ? 'Tuần mới bắt đầu!'
                            : `${timeRemaining.days} ngày ${timeRemaining.hours} giờ`
                        }
                    </span>
                </div>
                <div className="week-progress">
                    <span>{completedThisWeek}/3 thử thách</span>
                    <div className="progress-dots">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className={`dot ${i < completedThisWeek ? 'completed' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <Trophy size={20} className="stat-icon gold" />
                    <div>
                        <span className="stat-value">{stats.totalCompleted}</span>
                        <span className="stat-label">Tổng hoàn thành</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Zap size={20} className="stat-icon xp" />
                    <div>
                        <span className="stat-value">{stats.totalXP}</span>
                        <span className="stat-label">XP từ thử thách</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Star size={20} className="stat-icon level" />
                    <div>
                        <span className="stat-value">Lv.{level}</span>
                        <span className="stat-label">{xp} XP</span>
                    </div>
                </div>
            </div>

            {/* Active Challenges */}
            <section className="challenges-section">
                <h2>🎯 Thử thách tuần này</h2>
                <div className="challenges-grid">
                    {challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
                        >
                            <div className="challenge-header">
                                <span className="challenge-icon">{challenge.icon}</span>
                                <div className="challenge-info">
                                    <h3>{challenge.name}</h3>
                                    <p>{challenge.description}</p>
                                </div>
                                {challenge.completed && (
                                    <CheckCircle size={24} className="completed-icon" />
                                )}
                            </div>

                            <div className="challenge-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${challenge.progress}%`,
                                            background: challenge.completed
                                                ? 'var(--success)'
                                                : `linear-gradient(90deg, ${getDifficultyColor(challenge.difficulty)}, var(--primary))`
                                        }}
                                    />
                                </div>
                                <div className="progress-info">
                                    <span className="progress-text">{formatProgress(challenge)}</span>
                                    <span
                                        className="difficulty-badge"
                                        style={{ color: getDifficultyColor(challenge.difficulty) }}
                                    >
                                        {getDifficultyLabel(challenge.difficulty)}
                                    </span>
                                </div>
                            </div>

                            <div className="challenge-reward">
                                <Zap size={14} />
                                <span>+{challenge.xp} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* All Challenges Preview */}
            <section className="all-challenges-section">
                <h2>📋 Tất cả thử thách</h2>
                <p className="section-desc">Mỗi tuần sẽ được chọn ngẫu nhiên 3 thử thách (1 Dễ, 1 Trung bình, 1 Khó)</p>

                <div className="challenge-list">
                    {WEEKLY_CHALLENGES.map((challenge) => {
                        const isActive = activeChallenges.some(c => c.id === challenge.id);
                        return (
                            <div
                                key={challenge.id}
                                className={`challenge-list-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="list-icon">{challenge.icon}</span>
                                <div className="list-info">
                                    <span className="list-name">{challenge.name}</span>
                                    <span className="list-desc">{challenge.description}</span>
                                </div>
                                <span
                                    className="list-difficulty"
                                    style={{ color: getDifficultyColor(challenge.difficulty) }}
                                >
                                    {getDifficultyLabel(challenge.difficulty)}
                                </span>
                                <span className="list-xp">+{challenge.xp} XP</span>
                                {isActive && <span className="active-badge">Đang diễn ra</span>}
                            </div>
                        );
                    })}
                </div>
            </section>

            <style>{`
                .challenges-view { max-width: 900px; }

                .time-banner {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-lg);
                    padding: var(--spacing-lg);
                    background: linear-gradient(135deg, var(--primary-glow), var(--bg-surface));
                    border: 1px solid var(--primary);
                    border-radius: var(--radius-xl);
                    margin-bottom: var(--spacing-lg);
                }

                .time-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-lg);
                }

                .time-info { flex: 1; }
                .time-label { display: block; font-size: 0.8rem; color: var(--text-muted); }
                .time-value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }

                .week-progress { text-align: right; }
                .week-progress > span { font-size: 0.85rem; color: var(--text-secondary); }
                .progress-dots { display: flex; gap: var(--spacing-xs); margin-top: var(--spacing-xs); justify-content: flex-end; }
                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                }
                .dot.completed {
                    background: var(--success);
                    border-color: var(--success);
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-xl);
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                }

                .stat-icon { padding: var(--spacing-sm); border-radius: var(--radius-md); }
                .stat-icon.gold { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .stat-icon.xp { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
                .stat-icon.level { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

                .stat-value { display: block; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); }

                .challenges-section { margin-bottom: var(--spacing-2xl); }
                .challenges-section h2 { margin-bottom: var(--spacing-md); font-size: 1.1rem; }

                .challenges-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: var(--spacing-md);
                }

                .challenge-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-lg);
                    transition: all 0.2s;
                }

                .challenge-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .challenge-card.completed {
                    border-color: var(--success);
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), var(--bg-surface));
                }

                .challenge-header {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-md);
                }

                .challenge-icon {
                    font-size: 2rem;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                }

                .challenge-info { flex: 1; }
                .challenge-info h3 { font-size: 1rem; margin-bottom: 4px; }
                .challenge-info p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }

                .completed-icon { color: var(--success); }

                .challenge-progress { margin-bottom: var(--spacing-md); }
                .progress-bar {
                    height: 8px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                    margin-bottom: var(--spacing-xs);
                }
                .progress-fill {
                    height: 100%;
                    border-radius: var(--radius-full);
                    transition: width 0.3s ease;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                }
                .progress-text { color: var(--text-secondary); }
                .difficulty-badge { font-weight: 600; }

                .challenge-reward {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #a855f7;
                }

                .all-challenges-section h2 { margin-bottom: var(--spacing-xs); }
                .section-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: var(--spacing-lg); }

                .challenge-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }

                .challenge-list-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-sm) var(--spacing-md);
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all 0.2s;
                }

                .challenge-list-item.active {
                    border-color: var(--primary);
                    background: var(--primary-glow);
                }

                .list-icon { font-size: 1.25rem; }
                .list-info { flex: 1; }
                .list-name { display: block; font-size: 0.9rem; font-weight: 500; }
                .list-desc { display: block; font-size: 0.75rem; color: var(--text-muted); }
                .list-difficulty { font-size: 0.75rem; font-weight: 600; }
                .list-xp { font-size: 0.8rem; color: #a855f7; font-weight: 500; }
                .active-badge {
                    padding: 2px 8px;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .time-banner { flex-wrap: wrap; }
                    .week-progress { width: 100%; text-align: left; margin-top: var(--spacing-sm); }
                    .progress-dots { justify-content: flex-start; }
                    .stats-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
