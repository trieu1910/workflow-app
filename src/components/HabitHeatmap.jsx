import { useMemo } from 'react';
import { useHabitStore } from '../stores/useHabitStore';

export default function HabitHeatmap({ habitId, months = 4 }) {
    const { checkIns } = useHabitStore();

    const habitCheckIns = checkIns[habitId] || {};

    // Generate calendar data for last N months
    const calendarData = useMemo(() => {
        const data = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(1);

        // Align to start of week (Sunday)
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const currentDate = new Date(startDate);
        let week = [];

        while (currentDate <= today || week.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const isChecked = !!habitCheckIns[dateStr];
            const isFuture = currentDate > today;
            const isCurrentMonth = currentDate.getMonth() === today.getMonth();

            week.push({
                date: dateStr,
                checked: isChecked,
                future: isFuture,
                intensity: isChecked ? getIntensity(currentDate, today) : 0,
            });

            if (week.length === 7) {
                data.push(week);
                week = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);

            // Stop if we've gone past today and completed the week
            if (currentDate > today && week.length === 0) break;
        }

        // Add remaining partial week
        if (week.length > 0) {
            data.push(week);
        }

        return data;
    }, [habitCheckIns, months]);

    // Calculate streak intensity (more recent = more intense)
    function getIntensity(date, today) {
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return 4;
        if (diffDays < 14) return 3;
        if (diffDays < 30) return 2;
        return 1;
    }

    // Count stats
    const stats = useMemo(() => {
        const totalChecked = Object.keys(habitCheckIns).length;
        const last30Days = Object.keys(habitCheckIns).filter(date => {
            const d = new Date(date);
            const today = new Date();
            const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        }).length;
        return { totalChecked, last30Days };
    }, [habitCheckIns]);

    return (
        <div className="habit-heatmap">
            <div className="heatmap-stats">
                <span>{stats.totalChecked} lần check</span>
                <span>30 ngày gần đây: {stats.last30Days}</span>
            </div>

            <div className="heatmap-grid">
                {calendarData.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-week">
                        {week.map((day, dayIndex) => (
                            <div
                                key={day.date}
                                className={`heatmap-cell ${day.future ? 'future' : ''} level-${day.intensity}`}
                                title={`${day.date}: ${day.checked ? '✓' : '○'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="heatmap-legend">
                <span>Ít</span>
                <div className="legend-cells">
                    <div className="heatmap-cell level-0" />
                    <div className="heatmap-cell level-1" />
                    <div className="heatmap-cell level-2" />
                    <div className="heatmap-cell level-3" />
                    <div className="heatmap-cell level-4" />
                </div>
                <span>Nhiều</span>
            </div>

            <style>{`
        .habit-heatmap {
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-sm);
        }

        .heatmap-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-sm);
        }

        .heatmap-grid {
          display: flex;
          gap: 3px;
          overflow-x: auto;
          padding-bottom: var(--spacing-xs);
        }

        .heatmap-week {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
        }

        .heatmap-cell.future { opacity: 0.3; }
        .heatmap-cell.level-1 { background: rgba(34, 197, 94, 0.25); }
        .heatmap-cell.level-2 { background: rgba(34, 197, 94, 0.5); }
        .heatmap-cell.level-3 { background: rgba(34, 197, 94, 0.75); }
        .heatmap-cell.level-4 { background: var(--success); }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          justify-content: flex-end;
          margin-top: var(--spacing-sm);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .legend-cells { display: flex; gap: 2px; }
      `}</style>
        </div>
    );
}
