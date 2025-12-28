import { Inbox, CheckSquare, Grid3X3, Calendar, PlayCircle, BarChart3, Zap, Flame, Database, ArrowRight, FolderOpen, FileText, Settings, CalendarDays } from 'lucide-react';
import { useTaskStore, STAGES } from '../stores/useTaskStore';
import { useStatsStore, getLevelInfo } from '../stores/useStatsStore';

export default function Sidebar({ currentView, onViewChange, isOpen, onOpenDataManager }) {
  const tasks = useTaskStore((state) => state.tasks);
  const { totalXP, currentStreak } = useStatsStore();

  // Count by stage
  const inboxCount = tasks.filter(t => t.stage === STAGES.INBOX).length;
  const prioritizedCount = tasks.filter(t => t.stage === STAGES.PRIORITIZED).length;
  const scheduledCount = tasks.filter(t => t.stage === STAGES.SCHEDULED).length;
  const inProgressCount = tasks.filter(t => t.stage === STAGES.IN_PROGRESS).length;
  const doneCount = tasks.filter(t => t.stage === STAGES.DONE).length;

  const levelInfo = getLevelInfo(totalXP);

  // Pipeline navigation - tasks flow through these stages
  const pipelineItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
    { id: 'matrix', label: 'Phân loại', icon: Grid3X3, count: prioritizedCount },
    { id: 'schedule', label: 'Lên lịch', icon: Calendar, count: scheduledCount },
    { id: 'focus', label: 'Focus Queue', icon: PlayCircle, count: scheduledCount + inProgressCount },
    { id: 'done', label: 'Hoàn thành', icon: CheckSquare, count: doneCount },
  ];

  // Extra features
  const extraItems = [
    { id: 'weekly', label: 'Tổng kết tuần', icon: CalendarDays },
    { id: 'projects', label: 'Dự án', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Zap size={28} />
        <h1>WorkFlow</h1>
      </div>

      {/* XP & Level Display */}
      <div className="sidebar-xp">
        <div className="xp-level">
          <div className="xp-level-badge">{levelInfo.level}</div>
          <div className="xp-info">
            <span className="xp-label">Level {levelInfo.level}</span>
            <span className="xp-value">{totalXP} XP</span>
          </div>
        </div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={{ width: `${levelInfo.progress * 100}%` }}
          />
        </div>
        <div className="xp-next">
          {levelInfo.xpNeeded} XP đến level tiếp theo
        </div>
      </div>

      {/* Streak Display */}
      {currentStreak > 0 && (
        <div className="streak-display">
          <Flame size={20} />
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">ngày liên tiếp</span>
        </div>
      )}

      {/* Pipeline Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">📋 PIPELINE</div>
        {pipelineItems.map((item, index) => (
          <div key={item.id}>
            <button
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.count > 0 && <span className="badge">{item.count}</span>}
            </button>
            {index < pipelineItems.length - 1 && (
              <div className="pipeline-arrow">
                <ArrowRight size={12} />
              </div>
            )}
          </div>
        ))}

        {/* Extra Features */}
        <div className="nav-divider" />
        <div className="nav-section-title">⚡ THÊM</div>
        {extraItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Data Manager */}
        <div className="nav-divider" />
        <button
          className="nav-item"
          onClick={onOpenDataManager}
        >
          <Database size={20} />
          <span>Dữ liệu</span>
        </button>
      </nav>

      {/* Inbox Zero Indicator */}
      {inboxCount === 0 && (
        <div className="inbox-zero">
          ✨ Inbox Zero!
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="sidebar-footer">
        <p className="shortcut-hint">
          <kbd>Ctrl</kbd>+<kbd>K</kbd> thêm nhanh
        </p>
      </div>

      <style>{`
        .sidebar-xp {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .sidebar-xp .xp-level {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }
        
        .sidebar-xp .xp-level-badge {
          width: 36px;
          height: 36px;
          font-size: 1rem;
        }
        
        .sidebar-xp .xp-info {
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-xp .xp-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .sidebar-xp .xp-value {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .sidebar-xp .xp-bar {
          height: 6px;
          margin-bottom: var(--spacing-xs);
        }
        
        .sidebar-xp .xp-next {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
        }
        
        .streak-display {
          margin-bottom: var(--spacing-lg);
        }
        
        .streak-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .nav-section-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          padding: var(--spacing-sm) var(--spacing-md);
          margin-top: var(--spacing-sm);
        }
        
        .pipeline-arrow {
          display: flex;
          justify-content: center;
          color: var(--text-muted);
          opacity: 0.5;
          padding: 2px 0;
        }
        
        .nav-divider {
          height: 1px;
          background: var(--border-color);
          margin: var(--spacing-sm) 0;
        }
        
        .inbox-zero {
          background: linear-gradient(135deg, var(--success-bg), transparent);
          border: 1px solid var(--success);
          color: var(--success);
          text-align: center;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: var(--spacing-md);
        }
        
        .sidebar-footer {
          margin-top: auto;
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
        }
        
        .shortcut-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: var(--spacing-xs);
        }
        
        .shortcut-hint kbd {
          display: inline-block;
          padding: 1px 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.65rem;
          font-family: monospace;
        }
      `}</style>
    </aside>
  );
}
