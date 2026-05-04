import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Workspace, WorkspaceMember } from '../types/page';
import workspaceService from '../api/workspaceService';
import invitationService from '../api/invitationService';

interface WorkspaceContextType {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  invitations: any[];
  
  // Actions
  loadWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (data: {
    name: string;
    description?: string;
    icon?: string;
    settings?: {
      allowPublicSharing?: boolean;
      defaultMemberRole?: 'editor' | 'commenter' | 'viewer';
    };
  }) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  
  // Member management
  getMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
  addMember: (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  updateMemberRole: (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => Promise<void>;
  
  // Invitation management
  loadInvitations: () => Promise<void>;
  createInvitation: (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  declineInvitation: (token: string) => Promise<void>;
  cancelInvitation: (workspaceId: string, invitationId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<any[]>([]);

  // Load workspaces on mount
  useEffect(() => {
    const loadWorkspacesAndInvitations = async () => {
      try {
        await loadWorkspaces();
        await loadInvitations();
      } catch (error) {
        console.error('Failed to load workspaces:', error);
        setLoading(false);
      }
    };

    loadWorkspacesAndInvitations();
  }, []);

  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const loadedWorkspaces = await workspaceService.getAll();
      setWorkspaces(loadedWorkspaces);
      
      // Create default workspace if user has none
      if (loadedWorkspaces.length === 0) {
        try {
          const defaultWorkspace = await workspaceService.createWorkspace({
            name: 'Personal Workspace',
            description: 'Your personal workspace',
            icon: '🏠',
            settings: {
              allowPublicSharing: false,
              defaultMemberRole: 'editor'
            }
          });
          setWorkspaces([defaultWorkspace]);
          setCurrentWorkspace(defaultWorkspace);
        } catch (error) {
          console.error('Failed to create default workspace:', error);
        }
      } else if (!currentWorkspace) {
        // Set current workspace to first available if none selected
        setCurrentWorkspace(loadedWorkspaces[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  const loadInvitations = useCallback(async () => {
    try {
      const myInvitations = await invitationService.getMyInvitations();
      setInvitations(myInvitations);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  }, []);

  const createWorkspace = useCallback(async (data: {
    name: string;
    description?: string;
    icon?: string;
    settings?: {
      allowPublicSharing?: boolean;
      defaultMemberRole?: 'editor' | 'commenter' | 'viewer';
    };
  }): Promise<Workspace> => {
    try {
      const newWorkspace = await workspaceService.createWorkspace(data);
      setWorkspaces(prev => [...prev, newWorkspace]);
      return newWorkspace;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }, []);

  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    try {
      await workspaceService.updateWorkspace(id, data);
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  }, [currentWorkspace]);

  const deleteWorkspace = useCallback(async (id: string) => {
    try {
      await workspaceService.deleteWorkspace(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(null);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }, [currentWorkspace]);

  const getMembers = useCallback(async (workspaceId: string): Promise<WorkspaceMember[]> => {
    try {
      return await workspaceService.getMembers(workspaceId);
    } catch (error) {
      console.error('Failed to get members:', error);
      throw error;
    }
  }, []);

  const addMember = useCallback(async (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => {
    try {
      await workspaceService.addMember(workspaceId, userId, role);
      // Refresh workspaces to get updated member lists
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  }, [loadWorkspaces]);

  const removeMember = useCallback(async (workspaceId: string, userId: string) => {
    try {
      await workspaceService.removeMember(workspaceId, userId);
      // Refresh workspaces to get updated member lists
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }, [loadWorkspaces]);

  const updateMemberRole = useCallback(async (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => {
    try {
      await workspaceService.updateMemberRole(workspaceId, userId, role);
      // Refresh workspaces to get updated member lists
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }, [loadWorkspaces]);

  const createInvitation = useCallback(async (workspaceId: string, userId: string, role: 'admin' | 'editor' | 'commenter' | 'viewer') => {
    try {
      await invitationService.createInvitation(workspaceId, userId, role);
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  }, []);

  const acceptInvitation = useCallback(async (token: string) => {
    try {
      await invitationService.acceptInvitation(token);
      // Refresh workspaces and invitations
      await loadWorkspaces();
      await loadInvitations();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }, [loadWorkspaces, loadInvitations]);

  const declineInvitation = useCallback(async (token: string) => {
    try {
      await invitationService.declineInvitation(token);
      // Refresh invitations
      await loadInvitations();
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      throw error;
    }
  }, [loadInvitations]);

  const cancelInvitation = useCallback(async (workspaceId: string, invitationId: string) => {
    try {
      await invitationService.cancelInvitation(workspaceId, invitationId);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      throw error;
    }
  }, []);

  const value: WorkspaceContextType = {
    // State
    workspaces,
    currentWorkspace,
    loading,
    invitations,
    
    // Actions
    loadWorkspaces,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    
    // Member management
    getMembers,
    addMember,
    removeMember,
    updateMemberRole,
    
    // Invitation management
    loadInvitations,
    createInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}


export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}
