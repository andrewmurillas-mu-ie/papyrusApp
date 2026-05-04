import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { WorkspacePage, PageTreeItem, PagesContextType, CreatePageData, UpdatePageData } from '../types/page';
import pageService from '../api/pageService';
import { useWorkspace } from './WorkspaceContext';

const PagesContext = createContext<PagesContextType | null>(null);

interface PagesProviderProps {
  children: ReactNode;
}

export function PagesProvider({ children }: PagesProviderProps) {
  const [pages, setPages] = useState<WorkspacePage[]>([]);
  const [currentPage, setCurrentPage] = useState<WorkspacePage | null>(null);
  const [workspaceState, setWorkspaceState] = useState<any>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Get workspace context safely inside useEffect
  useEffect(() => {
    try {
      const workspace = useWorkspace();
      setWorkspaceState(workspace.currentWorkspace);
    } catch (error) {
      // WorkspaceProvider not available yet
      console.log('WorkspaceProvider not yet available');
    }
  }, []);

  // Load expanded state from localStorage (UI state only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('papyrus_expanded_pages');
      if (stored) {
        setExpandedPages(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load expanded pages:', error);
    }
  }, []);

  // Save expanded state to localStorage (UI state only)
  useEffect(() => {
    try {
      localStorage.setItem('papyrus_expanded_pages', JSON.stringify(Array.from(expandedPages)));
    } catch (error) {
      console.error('Failed to save expanded pages:', error);
    }
  }, [expandedPages]);

  // Load initial data from API
  useEffect(() => {
    const loadPages = async () => {
      try {
        console.log('Loading pages from API...');
        // For now, load all pages (will be updated to load by workspace)
        const loadedPages = await pageService.getAll();
        console.log('Pages loaded:', loadedPages);
        setPages(loadedPages);
        
        // Set current page to first available page
        const firstPage = loadedPages[0];
        if (firstPage) {
          setCurrentPage(firstPage);
        }
      } catch (error) {
        console.error('Failed to load pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  // Load pages for current workspace
  const loadWorkspacePages = useCallback(async (workspaceId: string) => {
    try {
      console.log('Loading pages for workspace:', workspaceId);
      const loadedPages = await pageService.getAll({ workspaceId });
      console.log('Workspace pages loaded:', loadedPages);
      setPages(loadedPages);
      
      // Set current page to first available page in workspace
      const firstPage = loadedPages[0];
      if (firstPage) {
        setCurrentPage(firstPage);
      }
    } catch (error) {
      console.error('Failed to load workspace pages:', error);
    }
  }, []);

  // Load pages when current workspace changes
  useEffect(() => {
    if (workspaceState) {
      loadWorkspacePages(workspaceState.id);
    } else {
      // Clear pages when no workspace is selected
      setPages([]);
      setCurrentPage(null);
    }
  }, [workspaceState, loadWorkspacePages]);

  // Getters
  const getPageById = useMemo(() => (id: string): WorkspacePage | undefined => {
    return pages.find(p => p.id === id);
  }, [pages]);

  const getRootPages = useMemo(() => (): WorkspacePage[] => {
    return pages.filter(p => !p.parentId);
  }, [pages]);

  const getChildPages = useMemo(() => (parentId: string): WorkspacePage[] => {
    return pages.filter(p => p.parentId === parentId);
  }, [pages]);

  const getPageTree = useMemo(() => (): PageTreeItem[] => {
    const buildTree = (parentId: string | null, level: number = 0): PageTreeItem[] => {
      const children = pages.filter(p => p.parentId === parentId);
      
      return children.map(page => ({
        ...page,
        children: buildTree(page.id, level + 1),
        level,
        isExpanded: expandedPages.has(page.id),
      }));
    };

    return buildTree(null);
  }, [pages, expandedPages]);

  const getFavoritePages = useMemo(() => (): WorkspacePage[] => {
    return pages.filter(p => p.isFavorite);
  }, [pages]);

  // Actions
  const createPage = useCallback(async (data: CreatePageData): Promise<WorkspacePage> => {
    try {
      console.log('Creating page with data:', data);
      
      // Require workspaceId for page creation
      if (!data.workspaceId) {
        throw new Error('workspaceId is required for page creation');
      }
      
      const newPage = await pageService.createPage({
        title: data.title || 'Untitled',
        icon: data.icon || '📄',
        content: data.content || '',
        workspaceId: data.workspaceId,
        parentId: data.parentId || null,
        isFavorite: false,
      });
      
      console.log('Page created successfully:', newPage);
      setPages(prev => [...prev, newPage]);
      
      // If creating as a child, expand the parent
      const parentId = data.parentId;
      if (parentId) {
        setExpandedPages(prev => {
          const newSet = new Set(prev);
          newSet.add(parentId);
          return newSet;
        });
      }
      
      return newPage;
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  }, []);

  const updatePage = useMemo(() => async (id: string, data: UpdatePageData): Promise<void> => {
    try {
      const updatedPage = await pageService.updatePage(id, data);
      setPages(prev => prev.map(p => p.id === id ? updatedPage : p));
      
      // Update current page if it's the one being updated
      if (currentPage?.id === id) {
        setCurrentPage(updatedPage);
      }
    } catch (error) {
      console.error('Failed to update page:', error);
      throw error;
    }
  }, [currentPage]);

  const renamePage = useMemo(() => async (id: string, title: string): Promise<void> => {
    await updatePage(id, { title });
  }, [updatePage]);

  const deletePage = useMemo(() => async (id: string): Promise<void> => {
    try {
      await pageService.deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
      
      // If current page was deleted, switch to first available page
      if (currentPage?.id === id) {
        const remainingPages = pages.filter(p => p.id !== id);
        const nextPage = remainingPages[0];
        if (nextPage) {
          setCurrentPage(nextPage);
        } else {
          setCurrentPage(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  }, [currentPage, pages]);

  
  const duplicatePage = useMemo(() => async (id: string): Promise<WorkspacePage | null> => {
    try {
      const originalPage = pages.find(p => p.id === id);
      if (!originalPage) return null;

      const duplicatedPage = await pageService.createPage({
        title: `${originalPage.title} (copy)`,
        icon: originalPage.icon,
        content: originalPage.content,
        parentId: originalPage.parentId,
        isFavorite: false,
      });
      
      setPages(prev => [...prev, duplicatedPage]);
      return duplicatedPage;
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      return null;
    }
  }, [pages]);

  const toggleFavorite = useMemo(() => async (id: string): Promise<void> => {
    const page = pages.find(p => p.id === id);
    if (page) {
      await updatePage(id, { isFavorite: !page.isFavorite });
    }
  }, [pages, updatePage]);

  const movePage = useMemo(() => async (id: string, newParentId: string | null): Promise<void> => {
    await updatePage(id, { parentId: newParentId });
  }, [updatePage]);

  const setCurrentPageById = useMemo(() => async (id: string): Promise<void> => {
    try {
      const page = pages.find(p => p.id === id);
      if (page) {
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to set current page:', error);
      throw error;
    }
  }, [pages]);

  // Workspace-related functions
  const setCurrentWorkspace = useCallback((workspace: any | null) => {
    // This will be handled by the WorkspaceContext
    // The pages will automatically reload when currentWorkspace changes
  }, [loadWorkspacePages]);

  const togglePageExpanded = useMemo(() => (id: string): void => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const value = useMemo(
    () => ({
      // State
      pages,
      currentPage,
      currentWorkspace: workspaceState,
      loading,
      expandedPages,
      
      // Getters
      getPageById,
      getRootPages,
      getChildPages,
      getPageTree,
      getFavoritePages,
      
      // Actions
      createPage,
      updatePage,
      renamePage,
      deletePage,
      duplicatePage,
      toggleFavorite,
      movePage,
      setCurrentPage: setCurrentPageById,
      setCurrentWorkspace,
      
      // UI state
      togglePageExpanded,
    }),
    [
      pages,
      currentPage,
      workspaceState,
      loading,
      expandedPages,
      getPageById,
      getRootPages,
      getChildPages,
      getPageTree,
      getFavoritePages,
      createPage,
      updatePage,
      renamePage,
      deletePage,
      duplicatePage,
      toggleFavorite,
      movePage,
      setCurrentPageById,
      setCurrentWorkspace,
      togglePageExpanded,
    ]
  );

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>;
}

export function usePages(): PagesContextType {
  const context = useContext(PagesContext);
  if (!context) throw new Error('usePages must be used within a PagesProvider');
  return context;
}
