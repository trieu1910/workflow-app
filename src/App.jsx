import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import InboxView from './components/InboxView';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import ScheduleView from './components/ScheduleView';
import FocusQueue from './components/FocusQueue';
import DoneView from './components/DoneView';
import StatsPanel from './components/StatsPanel';
import WeeklyReview from './components/WeeklyReview';
import ProjectsView from './components/ProjectsView';
import TemplatesView from './components/TemplatesView';
import SettingsView from './components/SettingsView';
import FocusMode from './components/FocusMode';
import QuickAdd from './components/QuickAdd';
import ThemeToggle from './components/ThemeToggle';
import TaskDetail from './components/TaskDetail';
import DataManager from './components/DataManager';
import { useTaskStore, STAGES } from './stores/useTaskStore';
import { useNotificationStore } from './stores/useNotificationStore';

export default function App() {
    const [currentView, setCurrentView] = useState('inbox');
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('workflow-theme');
        return saved || 'dark';
    });
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [focusTask, setFocusTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDataManager, setShowDataManager] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const tasks = useTaskStore((state) => state.tasks);
    const startTask = useTaskStore((state) => state.startTask);
    const checkAndNotify = useNotificationStore((state) => state.checkAndNotify);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('workflow-theme', theme);
    }, [theme]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowQuickAdd(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Notification check interval
    useEffect(() => {
        const interval = setInterval(() => {
            checkAndNotify(tasks);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [tasks, checkAndNotify]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [currentView]);

    const toggleTheme = () => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    };

    const handleStartFocus = (task) => {
        startTask(task.id);
        setFocusTask(task);
    };

    const handleCloseFocus = () => {
        setFocusTask(null);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'inbox':
                return <InboxView onOpenQuickAdd={() => setShowQuickAdd(true)} />;
            case 'matrix':
                return <EisenhowerMatrix />;
            case 'schedule':
                return <ScheduleView onStartFocus={handleStartFocus} />;
            case 'focus':
                return <FocusQueue onStartFocus={handleStartFocus} />;
            case 'done':
                return <DoneView />;
            case 'stats':
                return <StatsPanel />;
            case 'weekly':
                return <WeeklyReview />;
            case 'projects':
                return <ProjectsView />;
            case 'templates':
                return <TemplatesView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <InboxView onOpenQuickAdd={() => setShowQuickAdd(true)} />;
        }
    };

    return (
        <div className="app-container">
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                isOpen={sidebarOpen}
                onOpenDataManager={() => setShowDataManager(true)}
            />

            <main className="main-content">
                <div className="content-header">
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                </div>

                {renderContent()}
            </main>

            {/* Quick Add Modal */}
            <QuickAdd
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
            />

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Data Manager Modal */}
            {showDataManager && (
                <DataManager
                    onClose={() => setShowDataManager(false)}
                />
            )}

            {/* Focus Mode Overlay */}
            {focusTask && (
                <FocusMode
                    task={focusTask}
                    onClose={handleCloseFocus}
                />
            )}

            <style>{`
        .content-header {
          position: absolute;
          top: var(--spacing-lg);
          right: var(--spacing-xl);
          z-index: 50;
        }
        
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: var(--spacing-md);
          left: var(--spacing-md);
          z-index: 200;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }
        
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 90;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
          
          .sidebar-overlay {
            display: block;
          }
          
          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
            max-width: 100vw;
            padding: var(--spacing-md);
            padding-top: 70px;
          }
          
          .content-header {
            right: var(--spacing-md);
            top: var(--spacing-md);
          }
        }
      `}</style>
        </div>
    );
}
