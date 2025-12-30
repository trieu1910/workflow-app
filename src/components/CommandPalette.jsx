import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, Command, Calendar, Inbox, Target, Zap,
    CheckSquare, Settings, Moon, Sun, Clock, Plus,
    Layout, BarChart2, Award, BookOpen, FileText, Repeat, Hash
} from 'lucide-react';
import { useTaskStore } from '../stores/useTaskStore';
import { useGoalStore } from '../stores/useGoalStore';
import { useHabitStore } from '../stores/useHabitStore';

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
    const [activeCategory, setActiveCategory] = useState('all');
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Get data from stores
    const tasks = useTaskStore((state) => state.tasks);
    const goals = useGoalStore((state) => state.goals);
    const habits = useHabitStore((state) => state.habits);

    // Define commands
    const commands = useMemo(() => [
        {
            id: 'new-task',
            label: 'Tạo công việc mới',
            icon: Plus,
            shortcut: 'N',
            category: 'command',
            action: () => { onClose(); onOpenQuickAdd?.(); }
        },
        {
            id: 'today',
            label: 'Đi đến Hôm nay',
            icon: Calendar,
            shortcut: 'T',
            category: 'command',
            action: () => { onClose(); onNavigate?.('today'); }
        },
        {
            id: 'inbox',
            label: 'Đi đến Inbox',
            icon: Inbox,
            shortcut: 'I',
            category: 'command',
            action: () => { onClose(); onNavigate?.('inbox'); }
        },
        {
            id: 'goals',
            label: 'Đi đến Mục tiêu',
            icon: Target,
            shortcut: 'G',
            category: 'command',
            action: () => { onClose(); onNavigate?.('goals'); }
        },
        {
            id: 'habits',
            label: 'Đi đến Thói quen',
            icon: CheckSquare,
            shortcut: 'H',
            category: 'command',
            action: () => { onClose(); onNavigate?.('habits'); }
        },
        {
            id: 'reflection',
            label: 'Đi đến Nhật ký phản tư',
            icon: BookOpen,
            category: 'command',
            action: () => { onClose(); onNavigate?.('reflection'); }
        },
        {
            id: 'focus',
            label: 'Bắt đầu Focus Mode',
            icon: Zap,
            shortcut: 'F',
            category: 'command',
            action: () => { onClose(); onStartFocus?.(); }
        },
        {
            id: 'schedule',
            label: 'Xem lịch biểu',
            icon: Clock,
            category: 'command',
            action: () => { onClose(); onNavigate?.('schedule'); }
        },
        {
            id: 'matrix',
            label: 'Ma trận Eisenhower',
            icon: Layout,
            category: 'command',
            action: () => { onClose(); onNavigate?.('matrix'); }
        },
        {
            id: 'stats',
            label: 'Thống kê & Insights',
            icon: BarChart2,
            category: 'command',
            action: () => { onClose(); onNavigate?.('insights'); }
        },
        {
            id: 'achievements',
            label: 'Thành tựu',
            icon: Award,
            category: 'command',
            action: () => { onClose(); onNavigate?.('achievements'); }
        },
        {
            id: 'review',
            label: 'Weekly Review',
            icon: BookOpen,
            category: 'command',
            action: () => { onClose(); onNavigate?.('weekly'); }
        },
        {
            id: 'settings',
            label: 'Cài đặt',
            icon: Settings,
            category: 'command',
            action: () => { onClose(); onNavigate?.('settings'); }
        },
        {
            id: 'theme',
            label: currentTheme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode',
            icon: currentTheme === 'dark' ? Sun : Moon,
            category: 'command',
            action: () => { onClose(); onToggleTheme?.(); }
        },
    ], [onClose, onNavigate, onStartFocus, onOpenQuickAdd, currentTheme, onToggleTheme]);

    // Build searchable items from tasks, goals, habits
    const searchableItems = useMemo(() => {
        const items = [];

        // Add tasks (not completed, limit to 50)
        tasks
            .filter(t => !t.completed)
            .slice(0, 50)
            .forEach(task => {
                items.push({
                    id: `task-${task.id}`,
                    label: task.title,
                    sublabel: task.description || '',
                    icon: FileText,
                    category: 'task',
                    priority: task.priority,
                    action: () => {
                        onClose();
                        onNavigate?.('inbox');
                    }
                });
            });

        // Add goals
        goals
            .filter(g => g.status === 'active')
            .forEach(goal => {
                items.push({
                    id: `goal-${goal.id}`,
                    label: goal.title,
                    sublabel: goal.description || '',
                    icon: Target,
                    category: 'goal',
                    action: () => {
                        onClose();
                        onNavigate?.('goals');
                    }
                });
            });

        // Add habits
        habits
            .filter(h => h.active)
            .forEach(habit => {
                items.push({
                    id: `habit-${habit.id}`,
                    label: habit.title,
                    sublabel: habit.description || '',
                    icon: Repeat,
                    category: 'habit',
                    emoji: habit.icon,
                    action: () => {
                        onClose();
                        onNavigate?.('habits');
                    }
                });
            });

        return items;
    }, [tasks, goals, habits, onClose, onNavigate]);

    // Filter all items based on query
    const filteredResults = useMemo(() => {
        const q = query.toLowerCase().trim();

        // If no query, show commands only
        if (!q) {
            return {
                commands: commands.slice(0, 8),
                tasks: [],
                goals: [],
                habits: [],
                all: commands.slice(0, 8)
            };
        }

        // Filter commands
        const filteredCommands = commands.filter(cmd =>
            cmd.label.toLowerCase().includes(q) ||
            cmd.id.includes(q)
        );

        // Filter searchable items
        const filteredTasks = searchableItems.filter(item =>
            item.category === 'task' &&
            (item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q))
        ).slice(0, 5);

        const filteredGoals = searchableItems.filter(item =>
            item.category === 'goal' &&
            (item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q))
        ).slice(0, 5);

        const filteredHabits = searchableItems.filter(item =>
            item.category === 'habit' &&
            (item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q))
        ).slice(0, 5);

        // Combine all results
        const all = [...filteredCommands, ...filteredTasks, ...filteredGoals, ...filteredHabits];

        return {
            commands: filteredCommands,
            tasks: filteredTasks,
            goals: filteredGoals,
            habits: filteredHabits,
            all
        };
    }, [query, commands, searchableItems]);

    // Get active results based on category filter
    const activeResults = useMemo(() => {
        if (activeCategory === 'all') return filteredResults.all;
        if (activeCategory === 'command') return filteredResults.commands;
        if (activeCategory === 'task') return filteredResults.tasks;
        if (activeCategory === 'goal') return filteredResults.goals;
        if (activeCategory === 'habit') return filteredResults.habits;
        return filteredResults.all;
    }, [activeCategory, filteredResults]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setActiveCategory('all');
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
                    setSelectedIndex(i => Math.min(i + 1, activeResults.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (activeResults[selectedIndex]) {
                        activeResults[selectedIndex].action();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
                case 'Tab':
                    e.preventDefault();
                    // Cycle through categories
                    const cats = ['all', 'command', 'task', 'goal', 'habit'];
                    const currentIdx = cats.indexOf(activeCategory);
                    setActiveCategory(cats[(currentIdx + 1) % cats.length]);
                    setSelectedIndex(0);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, activeResults, onClose, activeCategory]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'command': return <Command size={12} />;
            case 'task': return <FileText size={12} />;
            case 'goal': return <Target size={12} />;
            case 'habit': return <Repeat size={12} />;
            default: return null;
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'command': return 'Lệnh';
            case 'task': return 'Task';
            case 'goal': return 'Mục tiêu';
            case 'habit': return 'Thói quen';
            default: return category;
        }
    };

    if (!isOpen) return null;

    const hasResults = query.trim() && (
        filteredResults.tasks.length > 0 ||
        filteredResults.goals.length > 0 ||
        filteredResults.habits.length > 0
    );

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
                        placeholder="Tìm kiếm tasks, goals, habits, lệnh..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        aria-label="Tìm kiếm"
                    />
                    <kbd className="command-kbd">ESC</kbd>
                </div>

                {/* Category Tabs */}
                {query.trim() && (
                    <div className="command-tabs">
                        <button
                            className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => { setActiveCategory('all'); setSelectedIndex(0); }}
                        >
                            Tất cả ({filteredResults.all.length})
                        </button>
                        {filteredResults.commands.length > 0 && (
                            <button
                                className={`tab-btn ${activeCategory === 'command' ? 'active' : ''}`}
                                onClick={() => { setActiveCategory('command'); setSelectedIndex(0); }}
                            >
                                <Command size={12} /> Lệnh ({filteredResults.commands.length})
                            </button>
                        )}
                        {filteredResults.tasks.length > 0 && (
                            <button
                                className={`tab-btn ${activeCategory === 'task' ? 'active' : ''}`}
                                onClick={() => { setActiveCategory('task'); setSelectedIndex(0); }}
                            >
                                <FileText size={12} /> Tasks ({filteredResults.tasks.length})
                            </button>
                        )}
                        {filteredResults.goals.length > 0 && (
                            <button
                                className={`tab-btn ${activeCategory === 'goal' ? 'active' : ''}`}
                                onClick={() => { setActiveCategory('goal'); setSelectedIndex(0); }}
                            >
                                <Target size={12} /> Goals ({filteredResults.goals.length})
                            </button>
                        )}
                        {filteredResults.habits.length > 0 && (
                            <button
                                className={`tab-btn ${activeCategory === 'habit' ? 'active' : ''}`}
                                onClick={() => { setActiveCategory('habit'); setSelectedIndex(0); }}
                            >
                                <Repeat size={12} /> Habits ({filteredResults.habits.length})
                            </button>
                        )}
                    </div>
                )}

                <div className="command-list" ref={listRef} role="listbox">
                    {activeResults.length === 0 ? (
                        <div className="command-empty">Không tìm thấy kết quả nào</div>
                    ) : (
                        activeResults.map((item, index) => (
                            <button
                                key={item.id}
                                className={`command-item ${index === selectedIndex ? 'selected' : ''} category-${item.category}`}
                                onClick={() => item.action()}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <div className="item-icon">
                                    {item.emoji ? (
                                        <span className="emoji-icon">{item.emoji}</span>
                                    ) : (
                                        <item.icon size={18} aria-hidden="true" />
                                    )}
                                </div>
                                <div className="item-content">
                                    <span className="command-label">{item.label}</span>
                                    {item.sublabel && (
                                        <span className="command-sublabel">{item.sublabel}</span>
                                    )}
                                </div>
                                <div className="item-meta">
                                    {item.shortcut && <kbd className="command-shortcut">{item.shortcut}</kbd>}
                                    {item.category !== 'command' && (
                                        <span className={`category-badge ${item.category}`}>
                                            {getCategoryIcon(item.category)}
                                            {getCategoryLabel(item.category)}
                                        </span>
                                    )}
                                    {item.priority && (
                                        <span className={`priority-badge ${item.priority}`}>
                                            {item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢'}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="command-footer">
                    <span>↑↓ di chuyển</span>
                    <span>Tab lọc</span>
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
            padding-top: 12vh;
            animation: fadeIn 0.15s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .command-palette {
            width: 100%;
            max-width: 600px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
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
            gap: var(--spacing-sm);
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--border-color);
            color: var(--text-muted);
          }

          .command-input {
            flex: 1;
            background: transparent;
            border: none;
            font-size: 1rem;
            color: var(--text-primary);
            outline: none;
          }

          .command-input::placeholder {
            color: var(--text-muted);
          }

          .command-kbd {
            padding: 2px 6px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.7rem;
            color: var(--text-muted);
            font-family: inherit;
          }

          .command-tabs {
            display: flex;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm) var(--spacing-md);
            border-bottom: 1px solid var(--border-color);
            overflow-x: auto;
          }

          .tab-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: var(--bg-secondary);
            border: 1px solid transparent;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            color: var(--text-secondary);
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
          }

          .tab-btn:hover { border-color: var(--primary); }
          .tab-btn.active {
            background: var(--primary);
            color: white;
          }

          .command-list {
            max-height: 360px;
            overflow-y: auto;
            padding: var(--spacing-xs);
          }

          .command-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            width: 100%;
            padding: var(--spacing-sm) var(--spacing-md);
            background: transparent;
            border: none;
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.15s;
            text-align: left;
          }

          .command-item:hover,
          .command-item.selected {
            background: var(--bg-secondary);
            color: var(--text-primary);
          }

          .command-item.selected {
            background: var(--primary-glow);
          }

          .item-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            flex-shrink: 0;
          }

          .emoji-icon { font-size: 1.1rem; }

          .item-content {
            flex: 1;
            min-width: 0;
          }

          .command-label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .command-sublabel {
            display: block;
            font-size: 0.75rem;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .item-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            flex-shrink: 0;
          }

          .command-shortcut {
            padding: 2px 8px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.7rem;
            color: var(--text-muted);
            font-family: inherit;
          }

          .category-badge {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px 8px;
            border-radius: var(--radius-sm);
            font-size: 0.65rem;
            font-weight: 500;
          }

          .category-badge.task {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
          }

          .category-badge.goal {
            background: rgba(168, 85, 247, 0.15);
            color: #a855f7;
          }

          .category-badge.habit {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
          }

          .priority-badge {
            font-size: 0.8rem;
          }

          .command-empty {
            padding: var(--spacing-xl);
            text-align: center;
            color: var(--text-muted);
            font-size: 0.9rem;
          }

          .command-footer {
            display: flex;
            gap: var(--spacing-lg);
            padding: var(--spacing-sm) var(--spacing-md);
            border-top: 1px solid var(--border-color);
            font-size: 0.7rem;
            color: var(--text-muted);
          }

          @media (max-width: 640px) {
            .command-palette {
              margin: 0 var(--spacing-md);
              max-width: none;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
