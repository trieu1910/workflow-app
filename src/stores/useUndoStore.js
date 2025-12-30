import { create } from 'zustand';

// Undo Store - Manages undo actions for destructive operations
export const useUndoStore = create((set, get) => ({
    undoStack: [],

    // Add an undoable action
    pushUndo: (action) => {
        const id = Date.now();
        const undoItem = {
            id,
            ...action,
            timestamp: Date.now(),
            expiresAt: Date.now() + 5000, // 5 seconds to undo
        };

        set((state) => ({
            undoStack: [...state.undoStack, undoItem]
        }));

        // Auto-remove after expiry
        setTimeout(() => {
            get().removeUndo(id);
        }, 5000);

        return id;
    },

    // Execute undo
    executeUndo: (id) => {
        const { undoStack } = get();
        const action = undoStack.find(a => a.id === id);

        if (action && action.undoFn) {
            action.undoFn();
            get().removeUndo(id);
            return true;
        }
        return false;
    },

    // Remove from stack
    removeUndo: (id) => {
        set((state) => ({
            undoStack: state.undoStack.filter(a => a.id !== id)
        }));
    },

    // Clear all
    clearAll: () => set({ undoStack: [] }),
}));
