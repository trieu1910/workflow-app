import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Play, Calendar, List } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { formatEstimatedTime } from '../utils/smartParser';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00
const SCROLL_SPEED = 8;
const SCROLL_ZONE = 80; // pixels from edge

export default function ScheduleView({ onStartFocus }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'
  const [draggedTask, setDraggedTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const timelineRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const tasks = useTaskStore((state) => state.tasks);
  const scheduleTask = useTaskStore((state) => state.scheduleTask);
  const startTask = useTaskStore((state) => state.startTask);

  const dateStr = currentDate.toISOString().split('T')[0];

  // Get "prioritized" tasks that need scheduling
  const toScheduleTasks = tasks.filter(t => t.stage === STAGES.PRIORITIZED);

  // Get scheduled tasks for current day
  const scheduledTasks = tasks.filter(t =>
    t.stage === STAGES.SCHEDULED && t.scheduledFor === dateStr
  );

  // Calculate workload
  const totalScheduledMinutes = scheduledTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const isOverloaded = totalScheduledMinutes > 8 * 60; // More than 8 hours

  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Auto-scroll logic when dragging near edges
  const handleAutoScroll = useCallback((e) => {
    if (!isDragging || !timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const mouseY = e.clientY;

    // Clear existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Check if near top edge
    if (mouseY < rect.top + SCROLL_ZONE && mouseY > rect.top - 50) {
      scrollIntervalRef.current = setInterval(() => {
        timeline.scrollTop -= SCROLL_SPEED;
      }, 16);
    }
    // Check if near bottom edge
    else if (mouseY > rect.bottom - SCROLL_ZONE && mouseY < rect.bottom + 50) {
      scrollIntervalRef.current = setInterval(() => {
        timeline.scrollTop += SCROLL_SPEED;
      }, 16);
    }
  }, [isDragging]);

  // Clean up scroll interval on drag end
  useEffect(() => {
    if (!isDragging && scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, [isDragging]);

  // Add global drag event listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalDrag = (e) => handleAutoScroll(e);
      document.addEventListener('dragover', handleGlobalDrag);
      return () => document.removeEventListener('dragover', handleGlobalDrag);
    }
  }, [isDragging, handleAutoScroll]);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleDrop = (e, hour) => {
    e.preventDefault();
    if (draggedTask) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      scheduleTask(draggedTask.id, dateStr, timeStr);
      setDraggedTask(null);
    }
    setIsDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleStartFocus = (task) => {
    startTask(task.id);
    if (onStartFocus) onStartFocus(task);
  };

  // Get tasks for a specific hour
  const getTasksAtHour = (hour) => {
    return scheduledTasks.filter(t => {
      if (!t.scheduledTime) return false;
      const taskHour = parseInt(t.scheduledTime.split(':')[0]);
      return taskHour === hour;
    });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();

  return (
    <div className="schedule-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lên lịch</h1>
          <p className="page-subtitle">
            {toScheduleTasks.length} task cần lên lịch • {scheduledTasks.length} đã lên lịch hôm nay
          </p>
        </div>
        <div className="view-toggle">
          <button
            className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('timeline')}
          >
            <Clock size={16} />
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="schedule-nav">
        <button className="btn btn-ghost" onClick={prevDay}>
          <ChevronLeft size={20} />
        </button>
        <div className="schedule-date">
          <h2>
            {currentDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h2>
          {!isToday && (
            <button className="btn btn-ghost btn-sm" onClick={goToToday}>
              Hôm nay
            </button>
          )}
        </div>
        <button className="btn btn-ghost" onClick={nextDay}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Overload Warning */}
      {isOverloaded && (
        <div className="overload-warning">
          ⚠️ Quá tải! ({Math.round(totalScheduledMinutes / 60)}h / 8h khuyến nghị)
        </div>
      )}

      <div className="schedule-container">
        {/* Tasks to Schedule Panel */}
        <div className="to-schedule-panel">
          <h4>📋 Cần lên lịch ({toScheduleTasks.length})</h4>
          {toScheduleTasks.length === 0 ? (
            <div className="panel-empty">
              <p>Không có task nào cần lên lịch!</p>
              <small>Phân loại task trong Ma trận trước</small>
            </div>
          ) : (
            <div className="to-schedule-list">
              {toScheduleTasks.map((task) => (
                <div
                  key={task.id}
                  className={`schedule-task-card priority-${task.priority}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="schedule-task-quadrant">
                    {task.quadrant === 'do' && '🔥'}
                    {task.quadrant === 'schedule' && '📅'}
                    {task.quadrant === 'delegate' && '👥'}
                    {task.quadrant === 'eliminate' && '🗑️'}
                  </div>
                  <div className="schedule-task-content">
                    <span className="schedule-task-title">{task.title}</span>
                    {task.estimatedMinutes && (
                      <span className="schedule-task-duration">
                        <Clock size={12} />
                        {formatEstimatedTime(task.estimatedMinutes)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Grid */}
        <div className="timeline-grid" ref={timelineRef}>
          {HOURS.map((hour) => {
            const hourTasks = getTasksAtHour(hour);
            const isPast = isToday && hour < currentHour;
            const isCurrent = isToday && hour === currentHour;

            return (
              <div
                key={hour}
                className={`timeline-row ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''} ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, hour)}
              >
                <div className="timeline-hour">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="timeline-slot">
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`scheduled-task priority-${task.priority}`}
                      style={{
                        height: `${Math.max((task.estimatedMinutes || 30) / 60 * 60, 40)}px`,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="scheduled-task-content">
                        <span className="scheduled-task-title">{task.title}</span>
                        {task.estimatedMinutes && (
                          <span className="scheduled-task-duration">
                            {formatEstimatedTime(task.estimatedMinutes)}
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStartFocus(task)}
                      >
                        <Play size={14} />
                        Focus
                      </button>
                    </div>
                  ))}
                  {hourTasks.length === 0 && (
                    <div className="timeline-slot-empty">
                      Kéo task vào đây
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .schedule-view {
          max-width: 1100px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .view-toggle {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
        }
        
        .schedule-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        
        .schedule-date {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          text-align: center;
        }
        
        .schedule-date h2 {
          font-size: 1.1rem;
          text-transform: capitalize;
        }
        
        .overload-warning {
          background: var(--danger-bg);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
          text-align: center;
          font-weight: 500;
        }
        
        .schedule-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--spacing-xl);
        }
        
        .to-schedule-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--spacing-md);
          height: fit-content;
          position: sticky;
          top: var(--spacing-lg);
        }
        
        .to-schedule-panel h4 {
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }
        
        .panel-empty {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--text-muted);
        }
        
        .panel-empty small {
          display: block;
          margin-top: var(--spacing-xs);
          font-size: 0.75rem;
        }
        
        .to-schedule-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .schedule-task-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all var(--transition-fast);
        }
        
        .schedule-task-card:hover {
          border-color: var(--primary);
        }
        
        .schedule-task-card:active {
          cursor: grabbing;
        }
        
        .schedule-task-card.priority-high {
          border-left: 3px solid var(--priority-high);
        }
        
        .schedule-task-card.priority-medium {
          border-left: 3px solid var(--priority-medium);
        }
        
        .schedule-task-card.priority-low {
          border-left: 3px solid var(--priority-low);
        }
        
        .schedule-task-quadrant {
          font-size: 1rem;
        }
        
        .schedule-task-content {
          flex: 1;
          min-width: 0;
        }
        
        .schedule-task-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .schedule-task-duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        
        .timeline-grid {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow-y: auto;
          max-height: 600px;
        }
        
        .timeline-row {
          display: flex;
          border-bottom: 1px solid var(--border-light);
          min-height: 60px;
          transition: background var(--transition-fast);
        }
        
        .timeline-row:last-child {
          border-bottom: none;
        }
        
        .timeline-row.past {
          opacity: 0.5;
        }
        
        .timeline-row.current {
          background: var(--primary-glow);
        }
        
        .timeline-row:hover,
        .timeline-row.drag-active {
          background: var(--bg-surface-hover);
        }
        
        .timeline-row.drag-active .timeline-slot-empty {
          opacity: 1;
          background: var(--primary-glow);
          border: 2px dashed var(--primary);
          border-radius: var(--radius-md);
        }
        
        .timeline-hour {
          width: 70px;
          padding: var(--spacing-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          border-right: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        
        .timeline-slot {
          flex: 1;
          padding: var(--spacing-xs);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .timeline-slot-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .timeline-row:hover .timeline-slot-empty {
          opacity: 1;
        }
        
        .scheduled-task {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          min-height: 40px;
          cursor: grab;
          transition: all var(--transition-fast);
        }
        
        .scheduled-task:active {
          cursor: grabbing;
          opacity: 0.8;
        }
        
        .scheduled-task:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .scheduled-task.priority-high {
          background: var(--danger-bg);
          border-left: 3px solid var(--priority-high);
        }
        
        .scheduled-task.priority-medium {
          background: var(--warning-bg);
          border-left: 3px solid var(--priority-medium);
        }
        
        .scheduled-task.priority-low {
          background: var(--success-bg);
          border-left: 3px solid var(--priority-low);
        }
        
        .scheduled-task-content {
          flex: 1;
        }
        
        .scheduled-task-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .scheduled-task-duration {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        @media (max-width: 900px) {
          .schedule-container {
            grid-template-columns: 1fr;
          }
          
          .to-schedule-panel {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
