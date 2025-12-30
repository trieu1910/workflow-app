import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, Command, Calendar, Inbox, Target, Zap,
    CheckSquare, Settings, Moon, Sun, Clock, Plus,
    Layout, BarChart2, Award, BookOpen
} from 'lucide-react';
import { useKeyboardShortcuts, SHORTCUTS_CONFIG, formatShortcut } from '../hooks/useKeyboardShortcuts';

export default function CommandPalette({
    isOpen,
    onClose,
    onNavigate,
    onStartFocus,
    onOpenQuickAdd,
    currentTheme,
    onToggleTheme
}) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Define commands
    const commands = useMemo(() => [
        {
            id: 'new-task',
            label: 'Tạo công việc mới',
            icon: Plus,
            shortcut: 'N',
            action: () => { onClose(); onOpenQuickAdd?.(); }
        },
        {
            id: 'today',
            label: 'Đi đến Hôm nay',
            icon: Calendar,
            shortcut: 'T',
            action: () => { onClose(); onNavigate?.('today'); }
        },
        {
            id: 'inbox',
            label: 'Đi đến Inbox',
            icon: Inbox,
            shortcut: 'I',
            action: () => { onClose(); onNavigate?.('inbox'); }
        },
        {
            id: 'goals',
            label: 'Đi đến Mục tiêu',
            icon: Target,
            shortcut: 'G',
            action: () => { onClose(); onNavigate?.('goals'); }
        },
        {
            id: 'habits',
            label: 'Đi đến Thói quen',
            icon: CheckSquare,
            shortcut: 'H',
            action: () => { onClose(); onNavigate?.('habits'); }
        },
        {
            id: 'focus',
            label: 'Bắt đầu Focus Mode',
            icon: Zap,
            shortcut: 'F',
            action: () => { onClose(); onStartFocus?.(); }
        },
        {
            id: 'schedule',
            label: 'Xem lịch biểu',
            icon: Clock,
            action: () => { onClose(); onNavigate?.('schedule'); }
        },
        {
            id: 'matrix',
            label: 'Ma trận Eisenhower',
            icon: Layout,
            action: () => { onClose(); onNavigate?.('matrix'); }
        },
        {
            id: 'stats',
            label: 'Thống kê & Insights',
            icon: BarChart2,
            action: () => { onClose(); onNavigate?.('insights'); }
        },
        {
            id: 'achievements',
            label: 'Thành tựu',
            icon: Award,
            action: () => { onClose(); onNavigate?.('achievements'); }
        },
        {
            id: 'review',
            label: 'Weekly Review',
            icon: BookOpen,
            action: () => { onClose(); onNavigate?.('review'); }
        },
        {
            id: 'settings',
            label: 'Cài đặt',
            icon: Settings,
            action: () => { onClose(); onNavigate?.('settings'); }
        },
        {
            id: 'theme',
            label: currentTheme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode',
            icon: currentTheme === 'dark' ? Sun : Moon,
            action: () => { onClose(); onToggleTheme?.(); }
        },
    ], [onClose, onNavigate, onStartFocus, onOpenQuickAdd, currentTheme, onToggleTheme]);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return commands;
        const q = query.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(q) ||
            cmd.id.includes(q)
        );
    }, [query, commands]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="command-overlay" onClick={onClose}>
            <div
                className="command-palette"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Command Palette"
            >
                <div className="command-input-wrapper">
                    <Search size={18} aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="Nhập lệnh hoặc tìm kiếm..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        aria-label="Tìm kiếm lệnh"
                    />
                    <kbd className="command-kbd">ESC</kbd>
                </div>

                <div className="command-list" ref={listRef} role="listbox">
                    {filteredCommands.length === 0 ? (
                        <div className="command-empty">Không tìm thấy lệnh nào</div>
                    ) : (
                        filteredCommands.map((cmd, index) => (
                            <button
                                key={cmd.id}
                                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                                onClick={() => cmd.action()}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <cmd.icon size={18} aria-hidden="true" />
                                <span className="command-label">{cmd.label}</span>
                                {cmd.shortcut && <kbd className="command-shortcut">{cmd.shortcut}</kbd>}
                            </button>
                        ))
                    )}
                </div>

                <div className="command-footer">
                    <span>↑↓ di chuyển</span>
                    <span>↵ chọn</span>
                    <span>ESC đóng</span>
                </div>

                <style>{`
          .command-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
            animation: fadeIn 0.15s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .command-palette {
            width: 100%;
            max-width: 560px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg), 0 25px 50px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            animation: slideDown 0.2s ease;
          }

          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .command-input-wrapper {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-4);
            border-bottom: 1px solid var(--border-subtle);
            color: var(--text-muted);
          }

          .command-input {
            flex: 1;
            background: transparent;
            border: none;
            font-size: var(--text-base);
            color: var(--text-primary);
            outline: none;
          }

          .command-input::placeholder {
            color: var(--text-placeholder);
          }

          .command-kbd {
            padding: 2px 6px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            font-size: var(--text-xs);
            color: var(--text-muted);
            font-family: inherit;
          }

          .command-list {
            max-height: 320px;
            overflow-y: auto;
            padding: var(--space-2);
          }

          .command-item {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            width: 100%;
            padding: var(--space-3);
            background: transparent;
            border: none;
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all var(--transition-fast);
            text-align: left;
          }

          .command-item:hover,
          .command-item.selected {
            background: var(--bg-hover);
            color: var(--text-primary);
          }

          .command-item.selected {
            background: var(--primary-muted);
            color: var(--primary);
          }

          .command-label {
            flex: 1;
            font-size: var(--text-sm);
            font-weight: 500;
          }

          .command-shortcut {
            padding: 2px 8px;
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-sm);
            font-size: var(--text-xs);
            color: var(--text-muted);
            font-family: inherit;
          }

          .command-empty {
            padding: var(--space-6);
            text-align: center;
            color: var(--text-muted);
            font-size: var(--text-sm);
          }

          .command-footer {
            display: flex;
            gap: var(--space-4);
            padding: var(--space-3) var(--space-4);
            border-top: 1px solid var(--border-subtle);
            font-size: var(--text-xs);
            color: var(--text-muted);
          }

          @media (max-width: 640px) {
            .command-palette {
              margin: 0 var(--space-4);
              max-width: none;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
