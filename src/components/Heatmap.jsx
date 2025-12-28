import { useState } from 'react';
import { useStatsStore } from '../stores/useStatsStore';

export default function Heatmap() {
    const { weeklyData } = useStatsStore();
    const [hoveredDay, setHoveredDay] = useState(null);

    // Generate last 365 days
    const generateYearData = () => {
        const days = [];
        const today = new Date();

        // Start from 365 days ago
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = weeklyData[dateStr] || { completed: 0, focusTime: 0 };

            days.push({
                date: dateStr,
                displayDate: date.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                }),
                dayOfWeek: date.getDay(),
                completed: dayData.completed,
                focusTime: dayData.focusTime,
            });
        }

        return days;
    };

    const yearData = generateYearData();

    // Group by weeks (columns)
    const getWeeks = () => {
        const weeks = [];
        let currentWeek = [];

        // Fill empty days at the start
        const firstDayOfWeek = yearData[0].dayOfWeek;
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        yearData.forEach((day) => {
            currentWeek.push(day);
            if (day.dayOfWeek === 6) { // Saturday
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // Push remaining days
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const weeks = getWeeks();

    // Get intensity level (0-4)
    const getIntensity = (completed) => {
        if (completed === 0) return 0;
        if (completed <= 2) return 1;
        if (completed <= 4) return 2;
        if (completed <= 6) return 3;
        return 4;
    };

    // Get month labels
    const getMonthLabels = () => {
        const labels = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const firstDayOfWeek = week.find(d => d !== null);
            if (firstDayOfWeek) {
                const month = new Date(firstDayOfWeek.date).getMonth();
                if (month !== lastMonth) {
                    labels.push({ weekIndex, month });
                    lastMonth = month;
                }
            }
        });

        return labels;
    };

    const monthLabels = getMonthLabels();
    const MONTHS_SHORT = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const DAYS_SHORT = ['CN', '', 'T3', '', 'T5', '', 'T7'];

    // Calculate stats
    const totalCompleted = yearData.reduce((sum, d) => sum + d.completed, 0);
    const totalFocusTime = yearData.reduce((sum, d) => sum + d.focusTime, 0);
    const activeDays = yearData.filter(d => d.completed > 0).length;

    const formatHours = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="heatmap-container">
            <div className="heatmap-header">
                <h3>📊 Hoạt động trong năm qua</h3>
                <div className="heatmap-stats">
                    <span><strong>{totalCompleted}</strong> tasks hoàn thành</span>
                    <span><strong>{activeDays}</strong> ngày hoạt động</span>
                    <span><strong>{formatHours(totalFocusTime)}</strong> thời gian tập trung</span>
                </div>
            </div>

            <div className="heatmap-wrapper">
                {/* Day labels */}
                <div className="heatmap-day-labels">
                    {DAYS_SHORT.map((day, i) => (
                        <span key={i}>{day}</span>
                    ))}
                </div>

                <div className="heatmap-content">
                    {/* Month labels */}
                    <div className="heatmap-month-labels">
                        {monthLabels.map((label, i) => (
                            <span
                                key={i}
                                style={{
                                    gridColumn: label.weekIndex + 1,
                                }}
                            >
                                {MONTHS_SHORT[label.month]}
                            </span>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="heatmap-grid">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="heatmap-week">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`heatmap-day ${day ? `intensity-${getIntensity(day.completed)}` : 'empty'}`}
                                        onMouseEnter={() => day && setHoveredDay(day)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <div className="heatmap-tooltip">
                    <strong>{hoveredDay.displayDate}</strong>
                    <span>{hoveredDay.completed} tasks hoàn thành</span>
                    {hoveredDay.focusTime > 0 && (
                        <span>{formatHours(hoveredDay.focusTime)} tập trung</span>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="heatmap-legend">
                <span>Ít hơn</span>
                <div className="legend-squares">
                    <div className="heatmap-day intensity-0" />
                    <div className="heatmap-day intensity-1" />
                    <div className="heatmap-day intensity-2" />
                    <div className="heatmap-day intensity-3" />
                    <div className="heatmap-day intensity-4" />
                </div>
                <span>Nhiều hơn</span>
            </div>

            <style>{`
        .heatmap-container {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          margin-top: var(--spacing-xl);
        }
        
        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }
        
        .heatmap-header h3 {
          margin: 0;
        }
        
        .heatmap-stats {
          display: flex;
          gap: var(--spacing-lg);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .heatmap-stats strong {
          color: var(--text-primary);
        }
        
        .heatmap-wrapper {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          padding-bottom: var(--spacing-sm);
        }
        
        .heatmap-day-labels {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-top: 20px;
        }
        
        .heatmap-day-labels span {
          height: 12px;
          font-size: 0.65rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        
        .heatmap-content {
          flex: 1;
          min-width: 0;
        }
        
        .heatmap-month-labels {
          display: grid;
          grid-auto-columns: 15px;
          grid-auto-flow: column;
          gap: 3px;
          margin-bottom: 4px;
          height: 16px;
        }
        
        .heatmap-month-labels span {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        
        .heatmap-grid {
          display: flex;
          gap: 3px;
        }
        
        .heatmap-week {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .heatmap-day {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .heatmap-day:hover {
          transform: scale(1.2);
        }
        
        .heatmap-day.empty {
          background: transparent;
          cursor: default;
        }
        
        .heatmap-day.intensity-0 {
          background: var(--bg-secondary);
        }
        
        .heatmap-day.intensity-1 {
          background: #9be9a8;
        }
        
        .heatmap-day.intensity-2 {
          background: #40c463;
        }
        
        .heatmap-day.intensity-3 {
          background: #30a14e;
        }
        
        .heatmap-day.intensity-4 {
          background: #216e39;
        }
        
        [data-theme="dark"] .heatmap-day.intensity-0 {
          background: var(--bg-secondary);
        }
        
        [data-theme="dark"] .heatmap-day.intensity-1 {
          background: #0e4429;
        }
        
        [data-theme="dark"] .heatmap-day.intensity-2 {
          background: #006d32;
        }
        
        [data-theme="dark"] .heatmap-day.intensity-3 {
          background: #26a641;
        }
        
        [data-theme="dark"] .heatmap-day.intensity-4 {
          background: #39d353;
        }
        
        .heatmap-tooltip {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm) var(--spacing-md);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
          z-index: 100;
        }
        
        .heatmap-tooltip strong {
          color: var(--text-primary);
        }
        
        .heatmap-tooltip span {
          color: var(--text-secondary);
        }
        
        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .legend-squares {
          display: flex;
          gap: 3px;
        }
        
        .legend-squares .heatmap-day:hover {
          transform: none;
        }
      `}</style>
        </div>
    );
}
