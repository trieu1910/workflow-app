import { useState } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, Clock, Tag } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { useTaskStore, STAGES } from '../stores/useTaskStore';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];
const ICONS = ['📁', '💼', '🏠', '📚', '💡', '🎯', '🚀', '⚡', '🎨', '🔧'];

export default function ProjectsView() {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0], icon: '📁' });
  const [expandedProject, setExpandedProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const getProjectTasks = (projectId) => {
    return tasks.filter(t => t.project === projectId && t.stage !== STAGES.DONE);
  };

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.project === projectId);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.stage === STAGES.DONE).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, progress, active: total - done };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateProject(editingId, formData);
    } else {
      addProject(formData);
    }

    setFormData({ name: '', color: COLORS[0], icon: '📁' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setFormData({ name: project.name, color: project.color, icon: project.icon });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Xóa project này? Tasks sẽ không bị xóa.')) {
      deleteProject(id);
    }
  };

  const toggleExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleAddTask = (projectId) => {
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      project: projectId,
      priority: 'medium',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="projects-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">📁 Dự án</h1>
          <p className="page-subtitle">{projects.length} dự án</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Thêm dự án
        </button>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="project-form-overlay">
          <form className="project-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>{editingId ? 'Sửa dự án' : 'Thêm dự án'}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Tên dự án</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên dự án..."
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <div className="icon-picker">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Màu sắc</label>
              <div className="color-picker">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Lưu' : 'Tạo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-list">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          const projectTasks = getProjectTasks(project.id);
          const isExpanded = expandedProject === project.id;

          return (
            <div key={project.id} className="project-item" style={{ '--project-color': project.color }}>
              <div className="project-card" onClick={() => toggleExpand(project.id)}>
                <div className="project-expand">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <span className="project-icon">{project.icon}</span>
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                  <div className="project-stats-row">
                    <span>{stats.active} đang làm</span>
                    <span>•</span>
                    <span>{stats.done} hoàn thành</span>
                  </div>
                </div>
                <div className="project-progress-mini">
                  <span>{stats.progress}%</span>
                  <div className="progress-bar-mini">
                    <div className="progress-fill-mini" style={{ width: `${stats.progress}%` }} />
                  </div>
                </div>
                <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(project)}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(project.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Expanded Task List */}
              {isExpanded && (
                <div className="project-tasks">
                  {/* Add Task Input */}
                  <div className="project-add-task">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Thêm task mới..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(project.id)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleAddTask(project.id)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  {projectTasks.length === 0 ? (
                    <div className="project-tasks-empty">
                      Chưa có task nào trong dự án này
                    </div>
                  ) : (
                    <div className="project-task-list">
                      {projectTasks.map((task) => (
                        <div key={task.id} className={`project-task priority-${task.priority}`}>
                          <span className="project-task-title">{task.title}</span>
                          <div className="project-task-meta">
                            <span className="stage-badge">{task.stage}</span>
                            {task.estimatedMinutes && (
                              <span><Clock size={12} /> {task.estimatedMinutes}m</span>
                            )}
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="projects-empty">
          <p>Chưa có dự án nào</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Tạo dự án đầu tiên
          </button>
        </div>
      )}

      <style>{`
        .projects-view {
          max-width: 800px;
        }
        
        .project-form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .project-form {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          width: 90%;
          max-width: 400px;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
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
        
        .form-group input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        
        .icon-picker, .color-picker {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }
        
        .icon-option {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          font-size: 1.25rem;
          cursor: pointer;
        }
        
        .icon-option.selected {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        
        .color-option {
          width: 32px;
          height: 32px;
          border: 2px solid transparent;
          border-radius: var(--radius-full);
          cursor: pointer;
        }
        
        .color-option.selected {
          border-color: white;
          box-shadow: 0 0 0 2px var(--primary);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-lg);
        }
        
        .projects-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .project-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--project-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .project-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .project-card:hover {
          background: var(--bg-secondary);
        }
        
        .project-expand {
          color: var(--text-muted);
        }
        
        .project-icon {
          font-size: 1.5rem;
        }
        
        .project-info {
          flex: 1;
        }
        
        .project-name {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        
        .project-stats-row {
          display: flex;
          gap: var(--spacing-sm);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .project-progress-mini {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.8rem;
          color: var(--project-color);
        }
        
        .progress-bar-mini {
          width: 60px;
          height: 4px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        
        .progress-fill-mini {
          height: 100%;
          background: var(--project-color);
        }
        
        .project-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .project-card:hover .project-actions {
          opacity: 1;
        }
        
        .project-actions button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
        }
        
        .project-actions button:hover {
          background: var(--primary);
          color: white;
        }
        
        .project-tasks {
          border-top: 1px solid var(--border-color);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
        }
        
        .project-add-task {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .project-add-task input {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
        }
        
        .project-tasks-empty {
          text-align: center;
          padding: var(--spacing-lg);
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .project-task-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .project-task {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--text-muted);
        }
        
        .project-task.priority-high { border-left-color: var(--priority-high); }
        .project-task.priority-medium { border-left-color: var(--priority-medium); }
        .project-task.priority-low { border-left-color: var(--priority-low); }
        
        .project-task-title {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        .project-task-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .stage-badge {
          padding: 2px 6px;
          background: var(--primary-glow);
          color: var(--primary);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          font-size: 0.65rem;
          font-weight: 600;
        }
        
        .projects-empty {
          text-align: center;
          padding: var(--spacing-2xl);
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-xl);
          color: var(--text-muted);
        }
        
        .projects-empty p {
          margin-bottom: var(--spacing-md);
        }
      `}</style>
    </div>
  );
}
