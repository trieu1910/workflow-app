import React, { memo } from 'react';

/**
 * DailyChart Component - Biểu đồ hoạt động theo ngày
 */
const DailyChart = memo(function DailyChart({
    dailyBreakdown,
    maxCompleted,
    maxFocusTime,
}) {
    return (
        <div className="chart-section">
            <h3>📈 Hoạt động theo ngày</h3>
            <div className="daily-chart">
                {dailyBreakdown.map((day) => {
                    const isToday = day.date === new Date().toISOString().split('T')[0];
                    return (
                        <div key={day.day} className={`chart-day ${isToday ? 'today' : ''}`}>
                            <div className="chart-bars">
                                <div
                                    className="chart-bar tasks-bar"
                                    style={{ height: `${(day.completed / maxCompleted) * 100}%` }}
                                    title={`${day.completed} tasks`}
                                />
                                <div
                                    className="chart-bar focus-bar"
                                    style={{ height: `${(day.focusTime / maxFocusTime) * 100}%` }}
                                    title={`${day.focusTime}m focus`}
                                />
                            </div>
                            <span className="chart-label">{day.day}</span>
                            <div className="chart-values">
                                <span>{day.completed}</span>
                                <span>{day.focusTime}m</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="chart-legend">
                <span className="legend-item"><span className="dot tasks"></span> Tasks</span>
                <span className="legend-item"><span className="dot focus"></span> Focus (phút)</span>
            </div>
        </div>
    );
});

export default DailyChart;
