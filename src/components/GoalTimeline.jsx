import { useMemo } from 'react';
import { Target, Flag, CheckCircle, Clock, Calendar } from 'lucide-react';
import { LIFE_AREAS } from '../stores/useGoalStore';

export default function GoalTimeline({ goals, milestones, tasks }) {
    // Filter active goals with deadlines
    const activeGoals = useMemo(() => {
        return goals
            .filter(g => g.status === 'active' && g.deadline)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }, [goals]);

    const today = new Date().toISOString().split('T')[0];

    // Calculate position on timeline (0-100%)
    const calculatePosition = (startDate, endDate, currentDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const current = new Date(currentDate).getTime();

        if (current <= start) return 0;
        if (current >= end) return 100;

        return ((current - start) / (end - start)) * 100;
    };

    // Get milestones for a goal
    const getMilestonesForGoal = (goalId) => {
        return milestones
            .filter(m => m.goalId === goalId)
            .sort((a, b) => {
                if (a.deadline && b.deadline) {
                    return new Date(a.deadline) - new Date(b.deadline);
                }
                return 0;
            });
    };

    // Get tasks for milestone
    const getTasksForMilestone = (milestoneId) => {
        return tasks.filter(t => t.milestoneId === milestoneId);
    };

    // Calculate completed percentage
    const getProgress = (goalId) => {
        const goalMilestones = getMilestonesForGoal(goalId);
        if (goalMilestones.length === 0) return 0;

        let totalProgress = 0;
        goalMilestones.forEach(m => {
            const mTasks = getTasksForMilestone(m.id);
            if (mTasks.length > 0) {
                const completed = mTasks.filter(t => t.stage === 'done').length;
                totalProgress += (completed / mTasks.length) * 100;
            }
        });
        return Math.round(totalProgress / goalMilestones.length);
    };

    const getAreaColor = (area) => {
        switch (area) {
            case 'health': return '#22c55e';
            case 'career': return '#3b82f6';
            case 'finance': return '#f59e0b';
            case 'relationships': return '#ec4899';
            case 'personal': return '#8b5cf6';
            case 'fun': return '#f97316';
            default: return 'var(--primary)';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getDaysRemaining = (deadline) => {
        const end = new Date(deadline);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (activeGoals.length === 0) {
        return (
            <div className="timeline-empty">
                <Target size={48} />
                <h3>Chưa có mục tiêu nào có deadline</h3>
                <p>Thêm deadline cho mục tiêu để xem timeline!</p>
            </div>
        );
    }

    return (
        <div className="goal-timeline">
            {activeGoals.map((goal) => {
                const goalMilestones = getMilestonesForGoal(goal.id);
                const progress = getProgress(goal.id);
                const color = getAreaColor(goal.area);
                const daysRemaining = getDaysRemaining(goal.deadline);

                // Assume start date is createdAt or 3 months before deadline
                const startDate = goal.createdAt?.split('T')[0] ||
                    new Date(new Date(goal.deadline).getTime() - 90 * 24 * 60 * 60 * 1000)
                        .toISOString().split('T')[0];

                const todayPosition = calculatePosition(startDate, goal.deadline, today);

                return (
                    <div key={goal.id} className="timeline-goal">
                        <div className="goal-header">
                            <div className="goal-title">
                                <span
                                    className="area-dot"
                                    style={{ background: color }}
                                />
                                <h3>{goal.title}</h3>
                            </div>
                            <div className="goal-meta">
                                <span className={`days-remaining ${daysRemaining < 7 ? 'urgent' : daysRemaining < 30 ? 'warning' : ''}`}>
                                    <Clock size={14} />
                                    {daysRemaining > 0 ? `${daysRemaining} ngày còn lại` : 'Đã quá hạn'}
                                </span>
                                <span className="progress-badge" style={{ background: color + '20', color }}>
                                    {progress}%
                                </span>
                            </div>
                        </div>

                        {/* Timeline Track */}
                        <div className="timeline-track">
                            {/* Background track */}
                            <div className="track-bg" />

                            {/* Progress fill */}
                            <div
                                className="track-progress"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${color}, ${color}80)`
                                }}
                            />

                            {/* Today marker */}
                            <div
                                className="today-marker"
                                style={{ left: `${todayPosition}%` }}
                                title="Hôm nay"
                            >
                                <div className="marker-line" />
                                <span className="marker-label">Hôm nay</span>
                            </div>

                            {/* Milestones */}
                            {goalMilestones.map((milestone, idx) => {
                                const mTasks = getTasksForMilestone(milestone.id);
                                const completed = mTasks.filter(t => t.stage === 'done').length;
                                const mProgress = mTasks.length > 0
                                    ? Math.round((completed / mTasks.length) * 100)
                                    : 0;

                                // Position based on order or deadline
                                const position = milestone.deadline
                                    ? calculatePosition(startDate, goal.deadline, milestone.deadline)
                                    : ((idx + 1) / (goalMilestones.length + 1)) * 100;

                                return (
                                    <div
                                        key={milestone.id}
                                        className={`milestone-marker ${mProgress === 100 ? 'completed' : ''}`}
                                        style={{ left: `${position}%` }}
                                        title={`${milestone.title} (${mProgress}%)`}
                                    >
                                        <div
                                            className="marker-dot"
                                            style={{
                                                borderColor: mProgress === 100 ? '#22c55e' : color,
                                                background: mProgress === 100 ? '#22c55e' : 'var(--bg-surface)'
                                            }}
                                        >
                                            {mProgress === 100 ? (
                                                <CheckCircle size={12} color="white" />
                                            ) : (
                                                <Flag size={10} style={{ color }} />
                                            )}
                                        </div>
                                        <div className="marker-tooltip">
                                            <strong>{milestone.title}</strong>
                                            <span>{mTasks.length} tasks • {mProgress}%</span>
                                            {milestone.deadline && (
                                                <span className="tooltip-date">
                                                    <Calendar size={10} /> {formatDate(milestone.deadline)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Start & End labels */}
                            <div className="track-labels">
                                <span className="label-start">{formatDate(startDate)}</span>
                                <span className="label-end">{formatDate(goal.deadline)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            <style>{`
                .goal-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xl);
                }

                .timeline-empty {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-muted);
                }
                .timeline-empty svg { margin-bottom: var(--spacing-md); opacity: 0.5; }
                .timeline-empty h3 { color: var(--text-secondary); margin-bottom: var(--spacing-sm); }

                .timeline-goal {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-lg);
                }

                .goal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-lg);
                }

                .goal-title {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .area-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .goal-title h3 {
                    font-size: 1rem;
                    margin: 0;
                }

                .goal-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .days-remaining {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
                .days-remaining.warning { color: #f59e0b; }
                .days-remaining.urgent { color: #ef4444; }

                .progress-badge {
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .timeline-track {
                    position: relative;
                    height: 80px;
                    padding-top: 30px;
                }

                .track-bg {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 8px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-full);
                    transform: translateY(-50%);
                }

                .track-progress {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    height: 8px;
                    border-radius: var(--radius-full);
                    transform: translateY(-50%);
                    transition: width 0.5s ease;
                }

                .today-marker {
                    position: absolute;
                    top: 10px;
                    transform: translateX(-50%);
                    z-index: 5;
                }

                .marker-line {
                    width: 2px;
                    height: 50px;
                    background: var(--primary);
                    margin: 0 auto;
                }

                .marker-label {
                    display: block;
                    font-size: 0.65rem;
                    color: var(--primary);
                    white-space: nowrap;
                    text-align: center;
                    margin-top: 2px;
                }

                .milestone-marker {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                    cursor: pointer;
                }

                .marker-dot {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .milestone-marker:hover .marker-dot {
                    transform: scale(1.2);
                }

                .marker-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: var(--spacing-sm);
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-lg);
                    z-index: 20;
                    margin-bottom: 8px;
                }

                .milestone-marker:hover .marker-tooltip {
                    opacity: 1;
                    visibility: visible;
                }

                .marker-tooltip strong {
                    display: block;
                    font-size: 0.85rem;
                    margin-bottom: 2px;
                }

                .marker-tooltip span {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .tooltip-date {
                    display: flex !important;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                }

                .track-labels {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }

                @media (max-width: 640px) {
                    .goal-header { flex-direction: column; gap: var(--spacing-sm); }
                    .goal-meta { width: 100%; justify-content: space-between; }
                }
            `}</style>
        </div>
    );
}
