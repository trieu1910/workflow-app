import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Play, Clock, Tag } from 'lucide-react';
import { useTemplateStore } from '../stores/useTemplateStore';
import { useTaskStore } from '../stores/useTaskStore';

const ICONS = ['📝', '📅', '💼', '📚', '💪', '🎯', '🚀', '⚡', '📊', '🔧'];
const PRIORITIES = [
    { value: 'high', label: 'Cao', color: '#ef4444' },
    { value: 'medium', label: 'Trung bình', color: '#f59e0b' },
    { value: 'low', label: 'Thấp', color: '#22c55e' },
];

export default function TemplatesView() {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
    const addTask = useTaskStore((state) => state.addTask);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        priority: 'medium',
        estimatedMinutes: 30,
        tags: [],
        icon: '📝',
    });
    const [tagInput, setTagInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.title.trim()) return;

        if (editingId) {
            updateTemplate(editingId, formData);
        } else {
            addTemplate(formData);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            priority: 'medium',
            estimatedMinutes: 30,
            tags: [],
            icon: '📝',
        });
        setTagInput('');
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (template) => {
        setFormData({
            name: template.name,
            title: template.title,
            priority: template.priority,
            estimatedMinutes: template.estimatedMinutes,
            tags: template.tags || [],
            icon: template.icon || '📝',
        });
        setEditingId(template.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Xóa template này?')) {
            deleteTemplate(id);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const handleUseTemplate = (template) => {
        addTask({
            title: template.title,
            priority: template.priority,
            estimatedMinutes: template.estimatedMinutes,
            tags: template.tags || [],
        });
        alert('✅ Đã tạo task từ template!');
    };

    return (
        <div className="templates-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📋 Templates</h1>
                    <p className="page-subtitle">{templates.length} template</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    Thêm template
                </button>
            </div>

            {/* Template Form */}
            {showForm && (
                <div className="template-form-overlay">
                    <form className="template-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h3>{editingId ? 'Sửa template' : 'Thêm template'}</h3>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tên template</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Daily Standup"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group icon-group">
                                <label>Icon</label>
                                <div className="icon-picker-small">
                                    {ICONS.slice(0, 5).map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className={`icon-option-small ${formData.icon === icon ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon })}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tiêu đề task</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Daily Standup Meeting"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Độ ưu tiên</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    {PRIORITIES.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Thời gian (phút)</label>
                                <input
                                    type="number"
                                    value={formData.estimatedMinutes}
                                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tags (Enter để thêm)</label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Nhập tag..."
                            />
                            {formData.tags.length > 0 && (
                                <div className="tags-list">
                                    {formData.tags.map((tag) => (
                                        <span key={tag} className="tag">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Lưu' : 'Tạo'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Templates Grid */}
            <div className="templates-grid">
                {templates.map((template) => (
                    <div key={template.id} className="template-card">
                        <div className="template-header">
                            <span className="template-icon">{template.icon || '📝'}</span>
                            <div className="template-info">
                                <h3 className="template-name">{template.name}</h3>
                                <p className="template-title">{template.title}</p>
                            </div>
                        </div>

                        <div className="template-meta">
                            <span className={`priority-badge priority-${template.priority}`}>
                                {PRIORITIES.find(p => p.value === template.priority)?.label}
                            </span>
                            {template.estimatedMinutes && (
                                <span className="duration">
                                    <Clock size={12} /> {template.estimatedMinutes}m
                                </span>
                            )}
                            {template.tags?.length > 0 && (
                                <span className="tag-count">
                                    <Tag size={12} /> {template.tags.length}
                                </span>
                            )}
                        </div>

                        <div className="template-actions">
                            <button className="btn btn-primary" onClick={() => handleUseTemplate(template)}>
                                <Play size={14} /> Dùng
                            </button>
                            <button className="btn btn-ghost" onClick={() => handleEdit(template)}>
                                <Edit2 size={14} />
                            </button>
                            <button className="btn btn-ghost" onClick={() => handleDelete(template.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .templates-view {
          max-width: 900px;
        }
        
        .template-form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .template-form {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          width: 90%;
          max-width: 500px;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        
        .form-row {
          display: flex;
          gap: var(--spacing-md);
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .form-group.icon-group {
          flex: 0 0 auto;
        }
        
        .form-group {
          margin-bottom: var(--spacing-md);
        }
        
        .form-group label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        
        .icon-picker-small {
          display: flex;
          gap: 4px;
        }
        
        .icon-option-small {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          cursor: pointer;
        }
        
        .icon-option-small.selected {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
        }
        
        .tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: var(--primary-glow);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
        }
        
        .tag button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-lg);
        }
        
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-md);
        }
        
        .template-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }
        
        .template-header {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .template-icon {
          font-size: 1.5rem;
        }
        
        .template-info {
          flex: 1;
        }
        
        .template-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .template-title {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .template-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          font-size: 0.8rem;
        }
        
        .duration, .tag-count {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
        }
        
        .template-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
        
        .template-actions .btn {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.85rem;
        }
      `}</style>
        </div>
    );
}
