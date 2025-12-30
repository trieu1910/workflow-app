import { useState, useMemo } from 'react';
import { BookHeart, Plus, Calendar, TrendingUp, Lightbulb, Heart, Trash2, Edit2, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useJournalStore, MOOD_LEVELS, ENTRY_TYPES } from '../stores/useJournalStore';
import EndDayReflection from './EndDayReflection';

export default function ReflectionView() {
    const { entries, deleteEntry, getStats, getMoodTrend } = useJournalStore();

    const [showReflectionModal, setShowReflectionModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [expandedEntry, setExpandedEntry] = useState(null);

    const stats = getStats();
    const moodTrend = getMoodTrend(7);

    // Filter entries
    const filteredEntries = useMemo(() => {
        if (filterType === 'all') return entries;
        return entries.filter(e => e.type === filterType);
    }, [entries, filterType]);

    // Group entries by date
    const groupedEntries = useMemo(() => {
        const groups = {};
        filteredEntries.forEach(entry => {
            if (!groups[entry.date]) {
                groups[entry.date] = [];
            }
            groups[entry.date].push(entry);
        });
        return groups;
    }, [filteredEntries]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === today) return 'Hôm nay';
        if (dateStr === yesterday) return 'Hôm qua';

        return new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(date);
    };

    const getMoodEmoji = (mood) => {
        return MOOD_LEVELS.find(m => m.value === mood)?.emoji || '😐';
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case ENTRY_TYPES.DAILY: return '📝 Phản tư hàng ngày';
            case ENTRY_TYPES.LESSON: return '💡 Bài học';
            case ENTRY_TYPES.GOAL_COMPLETE: return '🎯 Hoàn thành mục tiêu';
            case ENTRY_TYPES.GRATITUDE: return '🙏 Biết ơn';
            default: return type;
        }
    };

    return (
        <div className="reflection-view">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">📔 Nhật ký phản tư</h1>
                    <p className="page-subtitle">Ghi lại hành trình phát triển bản thân</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowReflectionModal(true)}>
                    <Plus size={18} />
                    Phản tư hôm nay
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalEntries}</span>
                        <span className="stat-label">Tổng bài viết</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.reflectionStreak}</span>
                        <span className="stat-label">Ngày liên tiếp</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">{getMoodEmoji(Math.round(stats.averageMood))}</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.averageMood || '-'}</span>
                        <span className="stat-label">Mood trung bình</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💡</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.lessonsLearned}</span>
                        <span className="stat-label">Bài học rút ra</span>
                    </div>
                </div>
            </div>

            {/* Mood Trend */}
            <div className="mood-trend-card">
                <h3><TrendingUp size={18} /> Mood 7 ngày qua</h3>
                <div className="mood-trend">
                    {moodTrend.map((day, index) => (
                        <div key={index} className="mood-day">
                            <div className={`mood-dot ${day.hasEntry ? 'has-entry' : ''}`}>
                                {day.hasEntry ? getMoodEmoji(day.mood) : '—'}
                            </div>
                            <span className="mood-date">
                                {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <Filter size={16} />
                <button
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`filter-btn ${filterType === ENTRY_TYPES.DAILY ? 'active' : ''}`}
                    onClick={() => setFilterType(ENTRY_TYPES.DAILY)}
                >
                    📝 Hàng ngày
                </button>
                <button
                    className={`filter-btn ${filterType === ENTRY_TYPES.LESSON ? 'active' : ''}`}
                    onClick={() => setFilterType(ENTRY_TYPES.LESSON)}
                >
                    💡 Bài học
                </button>
            </div>

            {/* Entries List */}
            <div className="entries-list">
                {Object.keys(groupedEntries).length === 0 ? (
                    <div className="empty-state">
                        <BookHeart size={48} />
                        <h3>Chưa có bài viết nào</h3>
                        <p>Bắt đầu ghi lại hành trình phát triển bản thân của bạn!</p>
                        <button className="btn btn-primary" onClick={() => setShowReflectionModal(true)}>
                            <Plus size={18} /> Viết bài đầu tiên
                        </button>
                    </div>
                ) : (
                    Object.entries(groupedEntries)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, dayEntries]) => (
                            <div key={date} className="date-group">
                                <h4 className="date-header">
                                    <Calendar size={16} />
                                    {formatDate(date)}
                                </h4>
                                {dayEntries.map(entry => (
                                    <div key={entry.id} className="entry-card">
                                        <div
                                            className="entry-header"
                                            onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                                        >
                                            <div className="entry-mood">{getMoodEmoji(entry.mood)}</div>
                                            <div className="entry-info">
                                                <span className="entry-type">{getTypeLabel(entry.type)}</span>
                                                {entry.highlights && (
                                                    <p className="entry-preview">
                                                        {entry.highlights.substring(0, 100)}
                                                        {entry.highlights.length > 100 ? '...' : ''}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="entry-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {expandedEntry === entry.id ?
                                                    <ChevronUp size={20} /> :
                                                    <ChevronDown size={20} />
                                                }
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedEntry === entry.id && (
                                            <div className="entry-content">
                                                {entry.highlights && (
                                                    <div className="content-section">
                                                        <h5><Heart size={14} /> Điều tốt đẹp</h5>
                                                        <p>{entry.highlights}</p>
                                                    </div>
                                                )}
                                                {entry.challenges && (
                                                    <div className="content-section challenges">
                                                        <h5>⚠️ Thử thách</h5>
                                                        <p>{entry.challenges}</p>
                                                    </div>
                                                )}
                                                {entry.lessons && (
                                                    <div className="content-section lessons">
                                                        <h5><Lightbulb size={14} /> Bài học</h5>
                                                        <p>{entry.lessons}</p>
                                                    </div>
                                                )}
                                                {entry.gratitude && entry.gratitude.length > 0 && (
                                                    <div className="content-section gratitude">
                                                        <h5>🙏 Biết ơn</h5>
                                                        <ul>
                                                            {entry.gratitude.map((g, i) => (
                                                                <li key={i}>{g}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {entry.tomorrowFocus && (
                                                    <div className="content-section tomorrow">
                                                        <h5>🎯 Ngày mai tập trung</h5>
                                                        <p>{entry.tomorrowFocus}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                )}
            </div>

            {/* Reflection Modal */}
            {showReflectionModal && (
                <EndDayReflection onClose={() => setShowReflectionModal(false)} />
            )}

            <style>{`
                .reflection-view { max-width: 900px; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                }

                .stat-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-md);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }

                .stat-icon { font-size: 1.5rem; }
                .stat-info { display: flex; flex-direction: column; }
                .stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); }

                .mood-trend-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    margin-bottom: var(--spacing-lg);
                }

                .mood-trend-card h3 {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    font-size: 1rem;
                    margin-bottom: var(--spacing-md);
                }

                .mood-trend {
                    display: flex;
                    justify-content: space-between;
                }

                .mood-day {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-xs);
                }

                .mood-dot {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    font-size: 1.5rem;
                    color: var(--text-muted);
                }

                .mood-dot.has-entry {
                    background: var(--primary-glow);
                }

                .mood-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: capitalize;
                }

                .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-lg);
                    color: var(--text-muted);
                }

                .filter-btn {
                    padding: var(--spacing-xs) var(--spacing-md);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-full);
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn:hover { border-color: var(--primary); }
                .filter-btn.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }

                .entries-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                }

                .date-group { }
                .date-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: var(--spacing-sm);
                    padding-bottom: var(--spacing-xs);
                    border-bottom: 1px solid var(--border-color);
                }

                .entry-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    margin-bottom: var(--spacing-sm);
                }

                .entry-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .entry-header:hover { background: var(--bg-secondary); }

                .entry-mood {
                    font-size: 1.5rem;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                }

                .entry-info { flex: 1; }
                .entry-type { font-size: 0.85rem; color: var(--text-secondary); }
                .entry-preview { 
                    font-size: 0.9rem; 
                    color: var(--text-primary); 
                    margin-top: var(--spacing-xs);
                    line-height: 1.4;
                }

                .entry-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    color: var(--text-muted);
                }

                .btn-icon {
                    padding: var(--spacing-xs);
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                }

                .btn-icon:hover { background: var(--bg-secondary); color: var(--danger); }

                .entry-content {
                    padding: var(--spacing-md);
                    padding-top: 0;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }

                .content-section {
                    padding: var(--spacing-md);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    border-left: 3px solid var(--primary);
                }

                .content-section h5 {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: var(--spacing-xs);
                }

                .content-section p {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                .content-section.challenges { border-left-color: var(--warning); }
                .content-section.lessons { border-left-color: #fbbf24; }
                .content-section.gratitude { border-left-color: #ec4899; }
                .content-section.tomorrow { border-left-color: var(--accent); }

                .content-section ul {
                    margin: 0;
                    padding-left: var(--spacing-lg);
                }

                .content-section li {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    margin-bottom: var(--spacing-xs);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-muted);
                }

                .empty-state svg { margin-bottom: var(--spacing-md); opacity: 0.5; }
                .empty-state h3 { color: var(--text-secondary); margin-bottom: var(--spacing-sm); }
                .empty-state p { margin-bottom: var(--spacing-lg); }

                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .mood-trend { overflow-x: auto; }
                }
            `}</style>
        </div>
    );
}
