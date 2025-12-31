import React, { memo } from 'react';
import { Target, AlertTriangle } from 'lucide-react';

/**
 * GoalProgressSection Component - Hiển thị tiến độ mục tiêu
 */
const GoalProgressSection = memo(function GoalProgressSection({
    goalProgress,
    stuckGoals,
}) {
    return (
        <div className="goal-progress-section">
            <h3><Target size={18} /> Tiến độ Mục tiêu</h3>

            {/* Stuck Goals Warning */}
            {stuckGoals.length > 0 && (
                <div className="stuck-goals-warning">
                    <div className="warning-header">
                        <AlertTriangle size={18} />
                        <span>{stuckGoals.length} mục tiêu đang "stuck" (không tiến triển 2 tuần)</span>
                    </div>
                    <div className="stuck-list">
                        {stuckGoals.map(item => (
                            <div key={item.goal.id} className="stuck-item">
                                <span className="goal-icon">{item.area?.icon}</span>
                                <span className="goal-name">{item.goal.title}</span>
                                <span className="pending-tasks">{item.pendingTasks} tasks còn lại</span>
                            </div>
                        ))}
                    </div>
                    <div className="suggestion">
                        💡 <strong>Gợi ý:</strong> Xem xét chia nhỏ tasks hoặc điều chỉnh Priority
                    </div>
                </div>
            )}

            {/* Active Goals Progress */}
            {goalProgress.length > 0 ? (
                <div className="goals-grid">
                    {goalProgress.map(item => (
                        <div
                            key={item.goal.id}
                            className={`goal-card ${item.isStuck ? 'stuck' : ''}`}
                            style={{ '--goal-color': item.area?.color }}
                        >
                            <div className="goal-header">
                                <span className="goal-icon">{item.area?.icon}</span>
                                <span className="goal-name">{item.goal.title}</span>
                            </div>
                            <div className="goal-progress-bar">
                                <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                            </div>
                            <div className="goal-stats">
                                <span className="progress-percent">{item.progress}%</span>
                                <span className="week-comparison">
                                    Tuần này: <strong>{item.completedThisWeek}</strong>
                                    {item.completedLastWeek > 0 && (
                                        <span className={item.completedThisWeek >= item.completedLastWeek ? 'positive' : 'negative'}>
                                            {' '}({item.completedThisWeek >= item.completedLastWeek ? '↑' : '↓'})
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-goals">
                    <p>Chưa có mục tiêu nào. Tạo mục tiêu để theo dõi tiến độ!</p>
                </div>
            )}
        </div>
    );
});

export default GoalProgressSection;
