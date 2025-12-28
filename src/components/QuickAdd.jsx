import { useState, useEffect, useRef } from 'react';
import { X, Zap, Calendar, Tag, Clock, Folder } from 'lucide-react';
import { parseTaskInput } from '../utils/smartParser';
import { useTaskStore } from '../stores/useTaskStore';
import { useProjectStore } from '../stores/useProjectStore';

export default function QuickAdd({ isOpen, onClose }) {
    const [input, setInput] = useState('');
    const [parsedPreview, setParsedPreview] = useState(null);
    const [selectedProject, setSelectedProject] = useState('');
    const inputRef = useRef(null);
    const addTask = useTaskStore((state) => state.addTask);
    const projects = useProjectStore((state) => state.projects);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (input.trim()) {
            const parsed = parseTaskInput(input);
            setParsedPreview(parsed);
        } else {
            setParsedPreview(null);
        }
    }, [input]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const parsed = parseTaskInput(input);
        addTask({
            ...parsed,
            project: selectedProject || null,
        });
        setInput('');
        setSelectedProject('');
        setParsedPreview(null);
        onClose();
    };

    if (!isOpen) return null;

    const selectedProjectData = projects.find(p => p.id === selectedProject);

    return (
        <div className="quick-add-overlay" onClick={onClose}>
            <div className="quick-add-modal" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="quick-add-input"
                        placeholder="Thêm việc mới... (VD: Họp team lúc 3h chiều ngày mai #high @work)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoComplete="off"
                    />

                    {/* Project Selector */}
                    <div className="quick-add-project">
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="project-select"
                        >
                            <option value="">📁 Không thuộc dự án</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.icon} {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>

                {parsedPreview && (
                    <div className="quick-add-preview">
                        <div className="preview-row">
                            <span className="preview-title">{parsedPreview.title}</span>
                        </div>
                        <div className="preview-meta">
                            {parsedPreview.priority && (
                                <span className={`priority-badge priority-${parsedPreview.priority}`}>
                                    <Zap size={12} />
                                    {parsedPreview.priority === 'high' ? 'Cao' :
                                        parsedPreview.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </span>
                            )}
                            {selectedProjectData && (
                                <span className="preview-tag project-tag" style={{ '--project-color': selectedProjectData.color }}>
                                    <Folder size={12} />
                                    {selectedProjectData.name}
                                </span>
                            )}
                            {parsedPreview.dueDate && (
                                <span className="preview-tag">
                                    <Calendar size={12} />
                                    {parsedPreview.dueDate}
                                    {parsedPreview.dueTime && ` lúc ${parsedPreview.dueTime}`}
                                </span>
                            )}
                            {parsedPreview.estimatedMinutes && (
                                <span className="preview-tag">
                                    <Clock size={12} />
                                    {parsedPreview.estimatedMinutes} phút
                                </span>
                            )}
                            {parsedPreview.tags.map((tag) => (
                                <span key={tag} className="preview-tag">
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="quick-add-hints">
                    <p>
                        <kbd>Enter</kbd> để thêm •
                        <kbd>Esc</kbd> để đóng •
                        Gõ <kbd>#high</kbd> <kbd>#low</kbd> cho độ ưu tiên •
                        <kbd>@tag</kbd> cho nhãn
                    </p>
                </div>
            </div>

            <style>{`
        .quick-add-project {
          padding: 0 var(--spacing-lg) var(--spacing-md);
        }
        
        .project-select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .project-select:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .quick-add-preview {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        
        .preview-row {
          margin-bottom: var(--spacing-sm);
        }
        
        .preview-title {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .preview-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        
        .preview-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .preview-tag.project-tag {
          background: color-mix(in srgb, var(--project-color) 15%, transparent);
          border-color: var(--project-color);
          color: var(--project-color);
        }
      `}</style>
        </div>
    );
}
