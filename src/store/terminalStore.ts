import { create } from 'zustand';

export type TerminalSplitMode = 'none' | 'horizontal' | 'vertical';

export interface TerminalSession {
  id: string;
  name: string;
  history: string[];
  currentDirectory: string;
  isActive: boolean;
}

export interface TerminalPane {
  id: string;
  sessions: TerminalSession[];
  activeSessionId: string;
}

interface TerminalState {
  // Split configuration
  splitMode: TerminalSplitMode;
  panes: TerminalPane[];
  activePaneId: string;
  
  // Terminal visibility and size
  isVisible: boolean;
  height: number;
  
  // Actions
  addSession: (paneId?: string) => void;
  removeSession: (paneId: string, sessionId: string) => void;
  setActiveSession: (paneId: string, sessionId: string) => void;
  renameSession: (paneId: string, sessionId: string, name: string) => void;
  addOutput: (paneId: string, sessionId: string, output: string) => void;
  clearSession: (paneId: string, sessionId: string) => void;
  
  // Split actions
  setSplitMode: (mode: TerminalSplitMode) => void;
  setActivePane: (paneId: string) => void;
  
  // Visibility
  toggleVisibility: () => void;
  setHeight: (height: number) => void;
}

const createNewSession = (index: number): TerminalSession => ({
  id: `session-${Date.now()}-${Math.random()}`,
  name: `Terminal ${index + 1}`,
  history: ['$ '],
  currentDirectory: '~',
  isActive: true,
});

const createNewPane = (): TerminalPane => {
  const sessionId = `session-${Date.now()}-${Math.random()}`;
  return {
    id: `pane-${Date.now()}-${Math.random()}`,
    sessions: [{
      id: sessionId,
      name: 'Terminal 1',
      history: ['$ '],
      currentDirectory: '~',
      isActive: true,
    }],
    activeSessionId: sessionId,
  };
};

export const useTerminalStore = create<TerminalState>((set, get) => {
  const initialPane = createNewPane();
  
  return {
    splitMode: 'none',
    panes: [initialPane],
    activePaneId: initialPane.id,
    isVisible: true,
    height: 300,

    addSession: (paneId) => {
      const targetPaneId = paneId || get().activePaneId;
      
      set(state => ({
        panes: state.panes.map(pane => {
          if (pane.id === targetPaneId) {
            const newSession = createNewSession(pane.sessions.length);
            return {
              ...pane,
              sessions: pane.sessions.map(s => ({ ...s, isActive: false })).concat(newSession),
              activeSessionId: newSession.id,
            };
          }
          return pane;
        })
      }));
    },

    removeSession: (paneId, sessionId) => {
      set(state => {
        const pane = state.panes.find(p => p.id === paneId);
        if (!pane || pane.sessions.length === 1) return state;

        return {
          panes: state.panes.map(p => {
            if (p.id === paneId) {
              const remainingSessions = p.sessions.filter(s => s.id !== sessionId);
              const wasActive = p.activeSessionId === sessionId;
              
              return {
                ...p,
                sessions: remainingSessions,
                activeSessionId: wasActive ? remainingSessions[0].id : p.activeSessionId,
              };
            }
            return p;
          })
        };
      });
    },

    setActiveSession: (paneId, sessionId) => {
      set(state => ({
        panes: state.panes.map(pane => {
          if (pane.id === paneId) {
            return {
              ...pane,
              activeSessionId: sessionId,
              sessions: pane.sessions.map(s => ({
                ...s,
                isActive: s.id === sessionId,
              })),
            };
          }
          return pane;
        })
      }));
    },

    renameSession: (paneId, sessionId, name) => {
      set(state => ({
        panes: state.panes.map(pane => {
          if (pane.id === paneId) {
            return {
              ...pane,
              sessions: pane.sessions.map(s =>
                s.id === sessionId ? { ...s, name } : s
              ),
            };
          }
          return pane;
        })
      }));
    },

    addOutput: (paneId, sessionId, output) => {
      set(state => ({
        panes: state.panes.map(pane => {
          if (pane.id === paneId) {
            return {
              ...pane,
              sessions: pane.sessions.map(s =>
                s.id === sessionId
                  ? { ...s, history: [...s.history, output] }
                  : s
              ),
            };
          }
          return pane;
        })
      }));
    },

    clearSession: (paneId, sessionId) => {
      set(state => ({
        panes: state.panes.map(pane => {
          if (pane.id === paneId) {
            return {
              ...pane,
              sessions: pane.sessions.map(s =>
                s.id === sessionId ? { ...s, history: ['$ '] } : s
              ),
            };
          }
          return pane;
        })
      }));
    },

    setSplitMode: (mode) => {
      set(state => {
        if (mode === 'none') {
          // Keep only the active pane
          const activePane = state.panes.find(p => p.id === state.activePaneId) || state.panes[0];
          return {
            splitMode: mode,
            panes: [activePane],
            activePaneId: activePane.id,
          };
        } else if (state.splitMode === 'none') {
          // Add a new pane
          const newPane = createNewPane();
          return {
            splitMode: mode,
            panes: [...state.panes, newPane],
          };
        } else {
          // Just change split direction
          return { splitMode: mode };
        }
      });
    },

    setActivePane: (paneId) => {
      set({ activePaneId: paneId });
    },

    toggleVisibility: () => {
      set(state => ({ isVisible: !state.isVisible }));
    },

    setHeight: (height) => {
      set({ height });
    },
  };
});
