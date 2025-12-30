import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsHelp({ isOpen, onClose }) {
    if (!isOpen) return null;

    const shortcuts = [
        {
            category: 'Điều hướng', items: [
                { keys: ['T'], desc: 'Đi đến Hôm nay' },
                { keys: ['I'], desc: 'Đi đến Inbox' },
                { keys: ['G'], desc: 'Đi đến Mục tiêu' },
                { keys: ['H'], desc: 'Đi đến Thói quen' },
            ]
        },
        {
            category: 'Hành động', items: [
                { keys: ['N'], desc: 'Tạo công việc mới' },
                { keys: ['F'], desc: 'Bắt đầu Focus Mode' },
                { keys: ['⌘', 'K'], desc: 'Mở Command Palette' },
                { keys: ['/'], desc: 'Tìm kiếm' },
            ]
        },
        {
            category: 'Chung', items: [
                { keys: ['?'], desc: 'Hiển thị phím tắt' },
                { keys: ['Esc'], desc: 'Đóng modal / Hủy' },
            ]
        },
    ];

    return (
        <div className="shortcuts-overlay" onClick={onClose}>
            <div
                className="shortcuts-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shortcuts-title"
            >
                <div className="shortcuts-header">
                    <div className="shortcuts-title-group">
                        <Keyboard size={20} aria-hidden="true" />
                        <h2 id="shortcuts-title">Phím tắt</h2>
                    </div>
                    <button
                        className="shortcuts-close"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="shortcuts-content">
                    {shortcuts.map(group => (
                        <div key={group.category} className="shortcuts-group">
                            <h3 className="shortcuts-category">{group.category}</h3>
                            <div className="shortcuts-list">
                                {group.items.map((shortcut, i) => (
                                    <div key={i} className="shortcut-row">
                                        <div className="shortcut-keys">
                                            {shortcut.keys.map((key, j) => (
                                                <span key={j}>
                                                    <kbd className="shortcut-key">{key}</kbd>
                                                    {j < shortcut.keys.length - 1 && <span className="key-plus">+</span>}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="shortcut-desc">{shortcut.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <style>{`
          .shortcuts-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.15s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .shortcuts-modal {
            width: 100%;
            max-width: 420px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            animation: scaleIn 0.2s ease;
            overflow: hidden;
          }

          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .shortcuts-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-4);
            border-bottom: 1px solid var(--border-subtle);
          }

          .shortcuts-title-group {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--text-primary);
          }

          .shortcuts-title-group h2 {
            font-size: var(--text-lg);
            font-weight: 600;
            margin: 0;
          }

          .shortcuts-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            border-radius: var(--radius-md);
            color: var(--text-muted);
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .shortcuts-close:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }

          .shortcuts-close:focus {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }

          .shortcuts-content {
            padding: var(--space-4);
            display: flex;
            flex-direction: column;
            gap: var(--space-5);
            max-height: 60vh;
            overflow-y: auto;
          }

          .shortcuts-category {
            font-size: var(--text-xs);
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 var(--space-3) 0;
          }

          .shortcuts-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
          }

          .shortcut-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-2) 0;
          }

          .shortcut-keys {
            display: flex;
            align-items: center;
            gap: var(--space-1);
          }

          .shortcut-key {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 28px;
            padding: 0 var(--space-2);
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-md);
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--text-primary);
            font-family: inherit;
          }

          .key-plus {
            color: var(--text-muted);
            font-size: var(--text-xs);
          }

          .shortcut-desc {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }

          @media (max-width: 480px) {
            .shortcuts-modal {
              margin: var(--space-4);
              max-width: none;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
