import { useState, useEffect, useMemo } from 'react';
import { Inbox, CheckSquare, Grid3X3, Calendar, PlayCircle, Zap, Flame, Database, ArrowRight, FolderOpen, FileText, Settings, CalendarDays, Target, PieChart, Repeat, Smile, Cloud, Moon, Star, Edit2, Plus, X, Trash2, RefreshCw } from 'lucide-react';
import { useTaskStore, STAGES, selectStageCounts } from '../stores/useTaskStore';
import { useStatsStore } from '../stores/useStatsStore';
import { useQuoteStore } from '../stores/useQuoteStore';
import { useShallow } from 'zustand/react/shallow';

const OWNER_NAME = "Trần Quang Triều";

export default function Sidebar({ currentView, onViewChange, isOpen, onOpenDataManager, onOpenCheckIn, onOpenMIT, onOpenShutdown }) {
  // Sử dụng selector với shallow compare - chỉ re-render khi counts thay đổi
  const stageCounts = useTaskStore(selectStageCounts, useShallow);
  const { currentStreak } = useStatsStore();
  const { quotes, getTodayQuote, getRandomQuote, addQuote, updateQuote, deleteQuote } = useQuoteStore();

  // Quote state
  const [quote, setQuote] = useState(null);
  const [showQuoteManager, setShowQuoteManager] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    setQuote(getTodayQuote());
  }, []);

  // Get greeting based on time - memoized vì không phụ thuộc props/state
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  // Destructure counts từ selector
  const { inbox: inboxCount, prioritized: prioritizedCount, scheduled: scheduledCount, inProgress: inProgressCount } = stageCounts;

  // Pipeline navigation - tasks flow through these stages
  const pipelineItems = [
    { id: 'today', label: '🏠 Hôm nay', icon: Zap, count: null },
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount },
    { id: 'matrix', label: 'Phân loại', icon: Grid3X3, count: prioritizedCount },
    { id: 'schedule', label: 'Lên lịch', icon: Calendar, count: scheduledCount },
    { id: 'focus', label: 'Focus Queue', icon: PlayCircle, count: scheduledCount + inProgressCount },
    { id: 'done', label: 'Hoàn thành', icon: CheckSquare, count: null },
  ];

  // Extra features
  const extraItems = [
    { id: 'goals', label: 'Mục tiêu', icon: Target },
    { id: 'goal-matrix', label: 'Ma trận ưu tiên', icon: Grid3X3 },
    { id: 'wheel', label: 'Bánh xe cuộc đời', icon: PieChart },
    { id: 'habits', label: 'Thói quen', icon: Repeat },
    { id: 'reflection', label: 'Nhật ký phản tư', icon: FolderOpen },
    { id: 'someday', label: 'Someday/Maybe', icon: Cloud },
    { id: 'weekly', label: 'Tổng kết tuần', icon: CalendarDays },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Zap size={28} />
        <h1>WorkFlow</h1>
      </div>

      {/* Owner Greeting */}
      <div className="owner-greeting">
        <p className="greeting-text">{greeting},</p>
        <p className="owner-name">{OWNER_NAME} ✨</p>
      </div>

      {/* Daily Quote */}
      {quote && (
        <div className="daily-quote">
          <p className="quote-text">"{quote.text}"</p>
          <div className="quote-footer">
            <p className="quote-author">— {quote.author}</p>
            <div className="quote-actions">
              <button onClick={() => setQuote(getRandomQuote())} title="Quote khác" className="quote-btn">
                <RefreshCw size={12} />
              </button>
              <button onClick={() => setShowQuoteManager(true)} title="Quản lý quotes" className="quote-btn">
                <Edit2 size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Manager Modal */}
      {showQuoteManager && (
        <div className="quote-manager-overlay" onClick={() => setShowQuoteManager(false)}>
          <div className="quote-manager" onClick={e => e.stopPropagation()}>
            <div className="qm-header">
              <h3>📜 Quản lý Quotes</h3>
              <button onClick={() => setShowQuoteManager(false)} className="btn btn-ghost">
                <X size={20} />
              </button>
            </div>

            {/* Add New Quote */}
            <div className="qm-add">
              <input
                type="text"
                placeholder="Nội dung quote..."
                value={newQuote.text}
                onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
              />
              <input
                type="text"
                placeholder="Tác giả"
                value={newQuote.author}
                onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (newQuote.text.trim()) {
                    addQuote(newQuote);
                    setNewQuote({ text: '', author: '' });
                  }
                }}
              >
                <Plus size={16} /> Thêm
              </button>
            </div>

            {/* Quote List */}
            <div className="qm-list">
              {quotes.map((q) => (
                <div key={q.id} className="qm-item">
                  {editingQuote?.id === q.id ? (
                    <div className="qm-edit-form">
                      <input
                        type="text"
                        value={editingQuote.text}
                        onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                      />
                      <input
                        type="text"
                        value={editingQuote.author}
                        onChange={(e) => setEditingQuote({ ...editingQuote, author: e.target.value })}
                      />
                      <div className="qm-edit-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            updateQuote(q.id, editingQuote);
                            setEditingQuote(null);
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingQuote(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="qm-content">
                        <p className="qm-text">"{q.text}"</p>
                        <p className="qm-author">— {q.author}</p>
                      </div>
                      <div className="qm-actions">
                        <button onClick={() => setEditingQuote({ ...q })} className="btn btn-ghost btn-sm">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (quotes.length > 1) deleteQuote(q.id);
                            else alert('Phải có ít nhất 1 quote!');
                          }}
                          className="btn btn-ghost btn-sm danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
          className="nav-item checkin-btn"
          onClick={onOpenCheckIn}
        >
          <Smile size={20} />
          <span>Check-in hôm nay</span>
        </button>
        <button
          className="nav-item mit-btn"
          onClick={onOpenMIT}
        >
          <Star size={20} />
          <span>3 MIT hôm nay</span>
        </button>
        <button
          className="nav-item shutdown-btn"
          onClick={onOpenShutdown}
        >
          <Moon size={20} />
          <span>Shutdown Ritual</span>
        </button>
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
        
        .owner-greeting {
          text-align: center;
          margin-bottom: var(--spacing-md);
        }
        
        .greeting-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        
        .owner-name {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .daily-quote {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          border-left: 3px solid var(--primary);
        }
        
        .quote-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.4;
          margin-bottom: var(--spacing-xs);
        }
        
        .quote-author {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .quote-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quote-actions { display: flex; gap: 4px; }
        .quote-btn {
          padding: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
        }
        .quote-btn:hover { background: var(--bg-surface); color: var(--primary); }

        /* Quote Manager Modal */
        .quote-manager-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .quote-manager {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .qm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .qm-add {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }

        .qm-add input {
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .qm-list {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .qm-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .qm-content { flex: 1; }
        .qm-text { font-size: 0.85rem; color: var(--text-primary); margin-bottom: 2px; }
        .qm-author { font-size: 0.75rem; color: var(--text-muted); }
        .qm-actions { display: flex; gap: 4px; }
        .qm-actions .danger:hover { color: var(--danger); }

        .qm-edit-form { display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; }
        .qm-edit-form input {
          padding: var(--spacing-xs);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .qm-edit-actions { display: flex; gap: var(--spacing-xs); }
      `}</style>
    </aside>
  );
}
