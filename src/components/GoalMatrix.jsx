import { useMemo } from 'react';
import { Target, Zap, Clock, AlertTriangle, Coffee } from 'lucide-react';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';

// Priority Matrix Quadrants
// High Impact + Low Effort = Quick Wins (DO FIRST)
// High Impact + High Effort = Major Projects (PLAN)
// Low Impact + Low Effort = Fill-ins (DELEGATE)
// Low Impact + High Effort = Thankless Tasks (ELIMINATE)

const QUADRANTS = {
    quickWins: {
        id: 'quickWins',
        title: '🚀 Quick Wins',
        subtitle: 'Làm ngay!',
        description: 'Impact cao, Effort thấp',
        color: '#22c55e',
        order: 1,
    },
    majorProjects: {
        id: 'majorProjects',
        title: '🎯 Major Projects',
        subtitle: 'Lên kế hoạch',
        description: 'Impact cao, Effort cao',
        color: '#3b82f6',
        order: 2,
    },
    fillIns: {
        id: 'fillIns',
        title: '☕ Fill-ins',
        subtitle: 'Khi rảnh',
        description: 'Impact thấp, Effort thấp',
        color: '#f59e0b',
        order: 3,
    },
    thankless: {
        id: 'thankless',
        title: '⚠️ Xem xét lại',
        subtitle: 'Cân nhắc bỏ',
        description: 'Impact thấp, Effort cao',
        color: '#ef4444',
        order: 4,
    },
};

function getQuadrant(impact, effort) {
    const highImpact = impact >= 3;
    const highEffort = effort >= 3;

    if (highImpact && !highEffort) return 'quickWins';
    if (highImpact && highEffort) return 'majorProjects';
    if (!highImpact && !highEffort) return 'fillIns';
    return 'thankless';
}

export default function GoalMatrix() {
    const { goals, updateGoal } = useGoalStore();

    const activeGoals = goals.filter(g => g.status === 'active');

    const categorizedGoals = useMemo(() => {
        const result = {
            quickWins: [],
            majorProjects: [],
            fillIns: [],
            thankless: [],
            uncategorized: [],
        };

        activeGoals.forEach(goal => {
            const impact = goal.priority?.impact || 3;
            const effort = goal.priority?.effort || 3;
            const quadrant = getQuadrant(impact, effort);
            result[quadrant].push({ ...goal, impact, effort });
        });

        return result;
    }, [activeGoals]);

    const handleDragStart = (e, goal) => {
        e.dataTransfer.setData('goalId', goal.id);
    };

    const handleDrop = (e, quadrantId) => {
        e.preventDefault();
        const goalId = e.dataTransfer.getData('goalId');

        // Calculate new impact/effort based on quadrant
        let impact = 3, effort = 3;
        switch (quadrantId) {
            case 'quickWins': impact = 4; effort = 2; break;
            case 'majorProjects': impact = 4; effort = 4; break;
            case 'fillIns': impact = 2; effort = 2; break;
            case 'thankless': impact = 2; effort = 4; break;
        }

        updateGoal(goalId, {
            priority: { impact, effort, quadrant: quadrantId }
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="goal-matrix">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Ma trận ưu tiên mục tiêu</h1>
                    <p className="page-subtitle">
                        Kéo thả mục tiêu để phân loại theo Impact vs Effort
                    </p>
                </div>
            </div>

            <div className="matrix-legend">
                <div className="legend-axis">
                    <span className="axis-label">⬆️ IMPACT cao</span>
                    <span className="axis-label">➡️ EFFORT tăng</span>
                </div>
            </div>

            <div className="matrix-grid">
                {Object.entries(QUADRANTS).map(([key, quadrant]) => (
                    <div
                        key={key}
                        className={`matrix-quadrant ${key}`}
                        style={{ '--quadrant-color': quadrant.color }}
                        onDrop={(e) => handleDrop(e, key)}
                        onDragOver={handleDragOver}
                    >
                        <div className="quadrant-header">
                            <h3>{quadrant.title}</h3>
                            <span className="quadrant-subtitle">{quadrant.subtitle}</span>
                            <span className="quadrant-desc">{quadrant.description}</span>
                        </div>

                        <div className="quadrant-goals">
                            {categorizedGoals[key].map(goal => {
                                const area = LIFE_AREAS[goal.area];
                                return (
                                    <div
                                        key={goal.id}
                                        className="matrix-goal-card"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, goal)}
                                    >
                                        <span className="goal-area-icon">{area?.icon}</span>
                                        <div className="goal-content">
                                            <span className="goal-title">{goal.title}</span>
                                            <span className="goal-metrics">
                                                Impact: {goal.impact}/5 • Effort: {goal.effort}/5
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {categorizedGoals[key].length === 0 && (
                                <div className="empty-quadrant">
                                    Kéo mục tiêu vào đây
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="matrix-summary">
                <div className="summary-card do-first">
                    <Zap size={24} />
                    <div>
                        <strong>Ưu tiên 1:</strong> Quick Wins ({categorizedGoals.quickWins.length})
                    </div>
                </div>
                <div className="summary-card plan">
                    <Target size={24} />
                    <div>
                        <strong>Ưu tiên 2:</strong> Major Projects ({categorizedGoals.majorProjects.length})
                    </div>
                </div>
                <div className="summary-card delegate">
                    <Coffee size={24} />
                    <div>
                        <strong>Ưu tiên 3:</strong> Fill-ins ({categorizedGoals.fillIns.length})
                    </div>
                </div>
                <div className="summary-card eliminate">
                    <AlertTriangle size={24} />
                    <div>
                        <strong>Cân nhắc:</strong> Xem xét lại ({categorizedGoals.thankless.length})
                    </div>
                </div>
            </div>

            <style>{`
        .goal-matrix { max-width: 1200px; }

        .matrix-legend {
          margin-bottom: var(--spacing-lg);
        }

        .legend-axis {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: var(--spacing-md);
          min-height: 500px;
        }

        .matrix-quadrant {
          background: var(--bg-surface);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .matrix-quadrant:hover {
          border-color: var(--quadrant-color);
        }

        .matrix-quadrant.quickWins { grid-area: 1 / 1 / 2 / 2; }
        .matrix-quadrant.majorProjects { grid-area: 1 / 2 / 2 / 3; }
        .matrix-quadrant.fillIns { grid-area: 2 / 1 / 3 / 2; }
        .matrix-quadrant.thankless { grid-area: 2 / 2 / 3 / 3; }

        .quadrant-header {
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid var(--quadrant-color);
        }

        .quadrant-header h3 {
          color: var(--quadrant-color);
          margin-bottom: 2px;
        }

        .quadrant-subtitle {
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }

        .quadrant-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .quadrant-goals {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          min-height: 100px;
        }

        .matrix-goal-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all var(--transition-fast);
        }

        .matrix-goal-card:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        .matrix-goal-card:active { cursor: grabbing; }

        .goal-area-icon { font-size: 1.2rem; }
        
        .goal-content { flex: 1; }
        .goal-title { display: block; color: var(--text-primary); font-weight: 500; font-size: 0.9rem; }
        .goal-metrics { font-size: 0.75rem; color: var(--text-muted); }

        .empty-quadrant {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-muted);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
        }

        .matrix-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          color: white;
        }

        .summary-card.do-first { background: #22c55e; }
        .summary-card.plan { background: #3b82f6; }
        .summary-card.delegate { background: #f59e0b; }
        .summary-card.eliminate { background: #ef4444; }

        @media (max-width: 768px) {
          .matrix-grid {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, auto);
          }

          .matrix-quadrant.quickWins { grid-area: auto; }
          .matrix-quadrant.majorProjects { grid-area: auto; }
          .matrix-quadrant.fillIns { grid-area: auto; }
          .matrix-quadrant.thankless { grid-area: auto; }
        }
      `}</style>
        </div>
    );
}
