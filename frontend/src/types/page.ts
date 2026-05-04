export interface WorkspacePage {
  id: string;
  title: string;
  icon?: string;
  workspaceId: string;
  parentId: string | null;
  content: string;
  coverUrl?: string;
  isFavorite: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageTreeItem extends WorkspacePage {
  children: PageTreeItem[];
  level: number;
  isExpanded: boolean;
}

export type CreatePageData = Pick<WorkspacePage, 'workspaceId'> & Partial<Pick<WorkspacePage, 'title' | 'icon' | 'parentId' | 'content'>>;
export type UpdatePageData = Partial<Pick<WorkspacePage, 'title' | 'icon' | 'content' | 'coverUrl' | 'isFavorite' | 'parentId'>>;

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  owner: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
  joinedAt: string;
  invitedBy?: string;
}

export interface WorkspaceSettings {
  allowPublicSharing: boolean;
  defaultMemberRole: 'editor' | 'commenter' | 'viewer';
}

export interface Invitation {
  id: string;
  workspace: Workspace;
  invitedUser: {
    id: string;
    fullName: string;
    email: string;
  };
  invitedBy: {
    id: string;
    fullName: string;
  };
  role: 'admin' | 'editor' | 'commenter' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
}

export interface PagesContextType {
  // State
  pages: WorkspacePage[];
  currentPage: WorkspacePage | null;
  currentWorkspace: Workspace | null;
  loading: boolean;
  
  // Getters
  getPageById: (id: string) => WorkspacePage | undefined;
  getRootPages: () => WorkspacePage[];
  getChildPages: (parentId: string) => WorkspacePage[];
  getPageTree: () => PageTreeItem[];
  getFavoritePages: () => WorkspacePage[];
  
  // Actions
  createPage: (data: CreatePageData) => Promise<WorkspacePage>;
  updatePage: (id: string, data: UpdatePageData) => Promise<void>;
  renamePage: (id: string, title: string) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  duplicatePage: (id: string) => Promise<WorkspacePage | null>;
  toggleFavorite: (id: string) => Promise<void>;
  movePage: (id: string, newParentId: string | null) => Promise<void>;
  setCurrentPage: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  
  // UI state
  togglePageExpanded: (id: string) => void;
  expandedPages: Set<string>;
}
