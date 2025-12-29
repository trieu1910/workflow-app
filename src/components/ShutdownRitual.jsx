import { useState } from 'react';
import { Moon, Check, X, Coffee, Inbox, Calendar, BookOpen, Brain } from 'lucide-react';
import { useWellbeingStore } from '../stores/useWellbeingStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

const SHUTDOWN_ITEMS = [
  { id: 'inbox_zero', label: 'Xử lý hết Inbox', icon: Inbox },
  { id: 'review_tomorrow', label: 'Xem tasks ngày mai', icon: Calendar },
  { id: 'gratitude', label: 'Ghi nhận thành tựu hôm nay', icon: BookOpen },
  { id: 'clear_desk', label: 'Dọn dẹp bàn làm việc', icon: Coffee },
  { id: 'plan_mit', label: 'Định hướng 3 MIT ngày mai', icon: Brain },
];

export default function ShutdownRitual({ onClose }) {
  const { saveDailyCheckIn, getTodayCheckIn } = useWellbeingStore();
  const tasks = useTaskStore((state) => state.tasks);

  const todayCheckIn = getTodayCheckIn();
  const [checkedItems, setCheckedItems] = useState(todayCheckIn?.shutdownChecklist || []);
  const [note, setNote] = useState(todayCheckIn?.shutdownNote || '');
  const [isComplete, setIsComplete] = useState(false);

  const inboxCount = tasks.filter(t => t.stage === STAGES.INBOX).length;
  const completedToday = tasks.filter(t => {
    if (!t.completedAt) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.completedAt.split('T')[0] === today;
  }).length;

  const toggleItem = (itemId) => {
    const updated = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];
    setCheckedItems(updated);
  };

  const handleComplete = () => {
    saveDailyCheckIn({
      shutdownChecklist: checkedItems,
      shutdownNote: note,
      shutdownAt: new Date().toISOString(),
    });
    setIsComplete(true);
    setTimeout(onClose, 2000);
  };

  const progress = (checkedItems.length / SHUTDOWN_ITEMS.length) * 100;

  return (
    <div className="shutdown-overlay">
      <div className="shutdown-modal">
        <button className="shutdown-close" onClick={onClose}>
          <X size={20} />
        </button>

        {isComplete ? (
          <div className="shutdown-complete">
            <Moon size={64} className="moon-icon" />
            <h2>Ngày làm việc kết thúc! 🌙</h2>
            <p>Nghỉ ngơi thật tốt. Hẹn gặp lại ngày mai!</p>
          </div>
        ) : (
          <>
            <div className="shutdown-header">
              <Moon size={32} className="header-icon" />
              <h2>Shutdown Ritual</h2>
              <p>Kết thúc ngày làm việc có ý thức - Cal Newport</p>
            </div>

            {/* Today's summary */}
            <div className="today-summary">
              <div className="summary-item">
                <span className="summary-value">{completedToday}</span>
                <span className="summary-label">Tasks hoàn thành</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{inboxCount}</span>
                <span className="summary-label">Còn trong Inbox</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="shutdown-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>{checkedItems.length}/{SHUTDOWN_ITEMS.length}</span>
            </div>

            {/* Checklist */}
            <div className="shutdown-checklist">
              {SHUTDOWN_ITEMS.map(item => {
                const Icon = item.icon;
                const isChecked = checkedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`checklist-item ${isChecked ? 'checked' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="item-checkbox">
                      {isChecked ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Reflection note */}
            <div className="shutdown-note">
              <label>📝 Ghi chú cuối ngày:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Điều gì đáng nhớ hôm nay?"
                rows={2}
              />
            </div>

            <button
              className="btn btn-primary shutdown-btn"
              onClick={handleComplete}
            >
              <Moon size={18} /> Kết thúc ngày làm việc
            </button>
          </>
        )}
      </div>

      <style>{`
        .shutdown-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, rgba(30,30,50,0.9), rgba(10,10,30,0.95));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .shutdown-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          width: 90%;
          max-width: 450px;
          position: relative;
        }

        .shutdown-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .shutdown-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .header-icon { color: #8b5cf6; margin-bottom: var(--spacing-sm); }
        .shutdown-header h2 { color: var(--text-primary); margin-bottom: var(--spacing-xs); }
        .shutdown-header p { color: var(--text-muted); font-size: 0.9rem; }

        .today-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .summary-item {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .summary-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .summary-label { font-size: 0.8rem; color: var(--text-muted); }

        .shutdown-progress {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .shutdown-progress .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .shutdown-progress .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #6366f1);
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }

        .shutdown-checklist {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .checklist-item:hover { background: var(--bg-tertiary); }
        .checklist-item.checked {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }

        .item-checkbox { color: var(--text-muted); }
        .checklist-item.checked .item-checkbox { color: #8b5cf6; }

        .shutdown-note label {
          display: block;
          margin-bottom: var(--spacing-xs);
          color: var(--text-secondary);
        }

        .shutdown-note textarea {
          width: 100%;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          resize: none;
          margin-bottom: var(--spacing-md);
        }

        .shutdown-btn { width: 100%; }

        .shutdown-complete {
          text-align: center;
          padding: var(--spacing-2xl);
        }

        .moon-icon {
          color: #8b5cf6;
          animation: float 2s ease-in-out infinite;
        }

        .shutdown-complete h2 {
          margin: var(--spacing-lg) 0 var(--spacing-sm);
          color: var(--text-primary);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
