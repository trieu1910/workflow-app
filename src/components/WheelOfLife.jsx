import { useMemo } from 'react';
import { useGoalStore, LIFE_AREAS } from '../stores/useGoalStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

export default function WheelOfLife() {
    const { goals, milestones } = useGoalStore();
    const tasks = useTaskStore((state) => state.tasks);

    // Calculate milestone progress realtime from tasks
    const getMilestoneProgress = (milestoneId) => {
        const milestoneTasks = tasks.filter(t => t.milestoneId === milestoneId);
        if (milestoneTasks.length === 0) return 0;
        const completed = milestoneTasks.filter(t => t.stage === STAGES.DONE).length;
        return Math.round((completed / milestoneTasks.length) * 100);
    };

    // Calculate goal progress realtime
    const getGoalProgressRealtime = (goalId) => {
        const goalMilestones = milestones.filter(m => m.goalId === goalId);
        if (goalMilestones.length === 0) return 0;

        let totalProgress = 0;
        goalMilestones.forEach(milestone => {
            totalProgress += getMilestoneProgress(milestone.id);
        });

        return Math.round(totalProgress / goalMilestones.length);
    };

    // Calculate area stats realtime
    const areaStats = useMemo(() => {
        const activeGoals = goals.filter(g => g.status === 'active');
        const stats = {};

        Object.keys(LIFE_AREAS).forEach((areaKey) => {
            const areaGoals = activeGoals.filter(g => g.area === areaKey);
            let totalProgress = 0;

            areaGoals.forEach(goal => {
                totalProgress += getGoalProgressRealtime(goal.id);
            });

            stats[areaKey] = {
                goalCount: areaGoals.length,
                averageProgress: areaGoals.length > 0 ? Math.round(totalProgress / areaGoals.length) : 0,
            };
        });

        return stats;
    }, [goals, milestones, tasks]);

    // Calculate radar chart data
    const chartData = useMemo(() => {
        const areas = Object.values(LIFE_AREAS);
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;
        const angleStep = (2 * Math.PI) / areas.length;

        return areas.map((area, index) => {
            const angle = angleStep * index - Math.PI / 2; // Start from top
            const stats = areaStats[area.id] || { averageProgress: 0, goalCount: 0 };
            const progress = stats.averageProgress / 100; // 0-1
            const radius = maxRadius * Math.max(0.1, progress); // Min 10% for visibility

            return {
                ...area,
                stats,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                labelX: centerX + (maxRadius + 25) * Math.cos(angle),
                labelY: centerY + (maxRadius + 25) * Math.sin(angle),
                angle,
            };
        });
    }, [areaStats]);

    // Create polygon path
    const polygonPoints = chartData.map(d => `${d.x},${d.y}`).join(' ');

    // Create grid circles
    const gridCircles = [0.25, 0.5, 0.75, 1].map(ratio => ratio * 120);

    return (
        <div className="wheel-of-life">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🎡 Bánh xe cuộc đời</h1>
                    <p className="page-subtitle">Cân bằng các lĩnh vực trong cuộc sống</p>
                </div>
            </div>

            <div className="wheel-container">
                <svg viewBox="0 0 300 300" className="wheel-svg">
                    {/* Grid circles */}
                    {gridCircles.map((r, i) => (
                        <circle
                            key={i}
                            cx="150"
                            cy="150"
                            r={r}
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Grid lines */}
                    {chartData.map((d, i) => (
                        <line
                            key={i}
                            x1="150"
                            y1="150"
                            x2={150 + 120 * Math.cos(d.angle)}
                            y2={150 + 120 * Math.sin(d.angle)}
                            stroke="var(--border-color)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Filled polygon */}
                    <polygon
                        points={polygonPoints}
                        fill="url(#wheelGradient)"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        opacity="0.8"
                    />

                    {/* Data points */}
                    {chartData.map((d, i) => (
                        <circle
                            key={i}
                            cx={d.x}
                            cy={d.y}
                            r="6"
                            fill={d.color}
                            stroke="white"
                            strokeWidth="2"
                        />
                    ))}

                    {/* Gradient definition */}
                    <defs>
                        <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                </svg>

                {/* Labels */}
                <div className="wheel-labels">
                    {chartData.map((d, i) => (
                        <div
                            key={i}
                            className="wheel-label"
                            style={{
                                left: `${(d.labelX / 300) * 100}%`,
                                top: `${(d.labelY / 300) * 100}%`,
                                color: d.color,
                            }}
                        >
                            <span className="label-icon">{d.icon}</span>
                            <span className="label-name">{d.name}</span>
                            <span className="label-percent">{d.stats.averageProgress}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Area Details */}
            <div className="areas-grid">
                {Object.values(LIFE_AREAS).map(area => {
                    const stats = areaStats[area.id] || { averageProgress: 0, goalCount: 0 };
                    const areaGoals = goals.filter(g => g.area === area.id && g.status === 'active');

                    return (
                        <div key={area.id} className="area-card" style={{ '--area-color': area.color }}>
                            <div className="area-header">
                                <span className="area-icon">{area.icon}</span>
                                <div className="area-info">
                                    <h3>{area.name}</h3>
                                    <span className="area-count">{stats.goalCount} mục tiêu</span>
                                </div>
                                <span className="area-progress">{stats.averageProgress}%</span>
                            </div>

                            <div className="area-bar">
                                <div className="area-bar-fill" style={{ width: `${stats.averageProgress}%` }} />
                            </div>

                            {areaGoals.length > 0 && (
                                <div className="area-goals">
                                    {areaGoals.slice(0, 3).map(goal => (
                                        <div key={goal.id} className="area-goal-item">
                                            • {goal.title} ({getGoalProgressRealtime(goal.id)}%)
                                        </div>
                                    ))}
                                    {areaGoals.length > 3 && (
                                        <div className="area-goal-more">+{areaGoals.length - 3} mục tiêu khác</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
        .wheel-of-life { max-width: 900px; }
        
        .wheel-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto var(--spacing-xl);
        }
        
        .wheel-svg {
          width: 100%;
          height: auto;
        }
        
        .wheel-labels {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .wheel-label {
          position: absolute;
          transform: translate(-50%, -50%);
          text-align: center;
          font-size: 0.75rem;
          white-space: nowrap;
        }
        
        .label-icon { display: block; font-size: 1.25rem; margin-bottom: 2px; }
        .label-name { display: block; font-weight: 500; }
        .label-percent { display: block; font-size: 0.7rem; opacity: 0.8; }
        
        .areas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-md);
        }
        
        .area-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--area-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }
        
        .area-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }
        
        .area-icon { font-size: 1.5rem; }
        .area-info { flex: 1; }
        .area-info h3 { font-size: 0.95rem; color: var(--text-primary); }
        .area-count { font-size: 0.75rem; color: var(--text-muted); }
        .area-progress { font-size: 1.1rem; font-weight: 700; color: var(--area-color); }
        
        .area-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }
        
        .area-bar-fill {
          height: 100%;
          background: var(--area-color);
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }
        
        .area-goals { font-size: 0.8rem; color: var(--text-secondary); }
        .area-goal-item { margin-bottom: 2px; }
        .area-goal-more { color: var(--text-muted); font-style: italic; }
      `}</style>
        </div>
    );
}
