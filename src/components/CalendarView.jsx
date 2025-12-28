import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function CalendarView({ onOpenQuickAdd }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const tasks = useTaskStore((state) => state.tasks);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(t => t.dueDate === dateStr && !t.completed);
    };

    // Navigate months
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const days = [];

        // Empty cells before first day
        for (let i = 0; i < startingDay; i++) {
            days.push({ day: null, date: null });
        }

        // Days of month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            days.push({ day, date });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    // Check if date is today
    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === today.toDateString();
    };

    // Check if date is selected
    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    // Get filtered tasks for selected date
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
        <div className="calendar-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lịch</h1>
                    <p className="page-subtitle">Xem công việc theo ngày</p>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="calendar-nav">
                <button className="btn btn-ghost" onClick={prevMonth}>
                    <ChevronLeft size={20} />
                </button>
                <div className="calendar-title">
                    <h2>{MONTHS[month]} {year}</h2>
                    <button className="btn btn-ghost btn-sm" onClick={goToToday}>
                        Hôm nay
                    </button>
                </div>
                <button className="btn btn-ghost" onClick={nextMonth}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-container">
                <div className="calendar-grid">
                    {/* Day headers */}
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="calendar-header-cell">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((item, index) => {
                        const dayTasks = item.date ? getTasksForDate(item.date) : [];
                        const hasOverdue = dayTasks.some(t => {
                            const due = new Date(t.dueDate);
                            return due < today;
                        });

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!item.day ? 'empty' : ''} ${isToday(item.date) ? 'today' : ''} ${isSelected(item.date) ? 'selected' : ''}`}
                                onClick={() => item.date && setSelectedDate(item.date)}
                            >
                                {item.day && (
                                    <>
                                        <span className="day-number">{item.day}</span>
                                        {dayTasks.length > 0 && (
                                            <div className="day-tasks">
                                                {dayTasks.slice(0, 3).map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className={`day-task-dot priority-${task.priority}`}
                                                        title={task.title}
                                                    />
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <span className="day-task-more">+{dayTasks.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Selected Date Detail */}
                {selectedDate && (
                    <div className="calendar-detail">
                        <div className="detail-header">
                            <h3>
                                {selectedDate.toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </h3>
                            <button className="btn btn-primary btn-sm" onClick={onOpenQuickAdd}>
                                <Plus size={16} />
                                Thêm việc
                            </button>
                        </div>

                        {selectedDateTasks.length === 0 ? (
                            <div className="detail-empty">
                                Không có công việc nào
                            </div>
                        ) : (
                            <div className="detail-tasks">
                                {selectedDateTasks.map((task) => (
                                    <div key={task.id} className="detail-task">
                                        <span className={`priority-dot priority-${task.priority}`} />
                                        <span className="detail-task-title">{task.title}</span>
                                        {task.dueTime && (
                                            <span className="detail-task-time">{task.dueTime}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .calendar-view {
          max-width: 1000px;
        }
        
        .calendar-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        
        .calendar-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .calendar-title h2 {
          font-size: 1.25rem;
          min-width: 180px;
          text-align: center;
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.85rem;
        }
        
        .calendar-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--spacing-xl);
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        
        .calendar-header-cell {
          padding: var(--spacing-sm);
          text-align: center;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        
        .calendar-day {
          aspect-ratio: 1;
          padding: var(--spacing-xs);
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          min-height: 80px;
        }
        
        .calendar-day:hover:not(.empty) {
          background: var(--bg-surface-hover);
        }
        
        .calendar-day.empty {
          background: var(--bg-secondary);
          cursor: default;
        }
        
        .calendar-day.today {
          background: var(--primary-glow);
        }
        
        .calendar-day.today .day-number {
          background: var(--primary);
          color: white;
          border-radius: var(--radius-full);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calendar-day.selected {
          background: var(--bg-surface-hover);
          border-color: var(--primary);
        }
        
        .day-number {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .day-tasks {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          margin-top: auto;
        }
        
        .day-task-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }
        
        .day-task-dot.priority-high {
          background: var(--priority-high);
        }
        
        .day-task-dot.priority-medium {
          background: var(--priority-medium);
        }
        
        .day-task-dot.priority-low {
          background: var(--priority-low);
        }
        
        .day-task-more {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        
        .calendar-detail {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          height: fit-content;
          position: sticky;
          top: var(--spacing-lg);
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }
        
        .detail-header h3 {
          font-size: 1rem;
          text-transform: capitalize;
        }
        
        .detail-empty {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-muted);
        }
        
        .detail-tasks {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .detail-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        
        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }
        
        .priority-dot.priority-high {
          background: var(--priority-high);
        }
        
        .priority-dot.priority-medium {
          background: var(--priority-medium);
        }
        
        .priority-dot.priority-low {
          background: var(--priority-low);
        }
        
        .detail-task-title {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        .detail-task-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        @media (max-width: 900px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }
          
          .calendar-detail {
            position: static;
          }
        }
      `}</style>
        </div>
    );
}
