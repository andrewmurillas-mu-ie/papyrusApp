import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { WorkspacePage, PageTreeItem, PagesContextType, CreatePageData, UpdatePageData } from '../types/page';
import pageService from '../api/pageService';

const PagesContext = createContext<PagesContextType | null>(null);

interface PagesProviderProps {
  children: ReactNode;
}

export function PagesProvider({ children }: PagesProviderProps) {
  const [pages, setPages] = useState<WorkspacePage[]>([]);
  const [currentPage, setCurrentPage] = useState<WorkspacePage | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load initial data from API
  useEffect(() => {
    const loadPages = async () => {
      try {
        const loadedPages = await pageService.getAll();
        setPages(loadedPages);
        
        // Set current page to first available page
        const firstPage = loadedPages.find(p => !p.isArchived);
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

  // Save expanded state to localStorage (UI state only)
  useEffect(() => {
    try {
      localStorage.setItem('papyrus_expanded_pages', JSON.stringify(Array.from(expandedPages)));
    } catch (error) {
      console.error('Failed to save expanded pages:', error);
    }
  }, [expandedPages]);

  // Getters
  const getPageById = useMemo(() => (id: string): WorkspacePage | undefined => {
    return pages.find(p => p.id === id);
  }, [pages]);

  const getRootPages = useMemo(() => (): WorkspacePage[] => {
    return pages.filter(p => !p.parentId && !p.isArchived);
  }, [pages]);

  const getChildPages = useMemo(() => (parentId: string): WorkspacePage[] => {
    return pages.filter(p => p.parentId === parentId && !p.isArchived);
  }, [pages]);

  const getPageTree = useMemo(() => (): PageTreeItem[] => {
    const buildTree = (parentId: string | null, level: number = 0): PageTreeItem[] => {
      const children = pages.filter(p => p.parentId === parentId && !p.isArchived);
      
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
    return pages.filter(p => p.isFavorite && !p.isArchived);
  }, [pages]);

  // Actions
  const createPage = useMemo(() => async (data?: CreatePageData): Promise<WorkspacePage> => {
    try {
      const newPage = await pageService.createPage({
        title: data?.title || 'Untitled',
        icon: data?.icon || '📄',
        content: data?.content || '',
        parentId: data?.parentId || null,
        isFavorite: false,
        isArchived: false,
      });
      
      setPages(prev => [...prev, newPage]);
      
      // If creating as a child, expand the parent
      if (data?.parentId) {
        setExpandedPages(prev => new Set([...prev, data.parentId]));
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

  const renamePage = useMemo(() => (id: string, title: string): void => {
    updatePage(id, { title });
  }, [updatePage]);

  const deletePage = useMemo(() => async (id: string): Promise<void> => {
    try {
      await pageService.deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
      
      // If current page was deleted, switch to first available page
      if (currentPage?.id === id) {
        const remainingPages = pages.filter(p => p.id !== id && !p.isArchived);
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

  const archivePage = useMemo(() => async (id: string): Promise<void> => {
    try {
      await updatePage(id, { isArchived: true });
      setPages(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p));
      
      // If current page was archived, switch to first available page
      if (currentPage?.id === id) {
        const remainingPages = pages.filter(p => p.id !== id && !p.isArchived);
        const nextPage = remainingPages[0];
        if (nextPage) {
          setCurrentPage(nextPage);
        } else {
          setCurrentPage(null);
        }
      }
    } catch (error) {
      console.error('Failed to archive page:', error);
      throw error;
    }
  }, [currentPage, pages, updatePage]);

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
        isArchived: false,
      });
      
      setPages(prev => [...prev, duplicatedPage]);
      return duplicatedPage;
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      return null;
    }
  }, [pages]);

  const toggleFavorite = useMemo(() => (id: string): void => {
    const page = pages.find(p => p.id === id);
    if (page) {
      updatePage(id, { isFavorite: !page.isFavorite });
    }
  }, [pages, updatePage]);

  const movePage = useMemo(() => (id: string, newParentId: string | null): void => {
    updatePage(id, { parentId: newParentId });
  }, [updatePage]);

  const setCurrentPageById = useMemo(() => async (id: string): Promise<void> => {
    try {
      const page = pages.find(p => p.id === id && !p.isArchived);
      if (page) {
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to set current page:', error);
      throw error;
    }
  }, [pages]);

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
      archivePage,
      duplicatePage,
      toggleFavorite,
      movePage,
      setCurrentPage: setCurrentPageById,
      
      // UI state
      togglePageExpanded,
    }),
    [
      pages,
      currentPage,
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
      archivePage,
      duplicatePage,
      toggleFavorite,
      movePage,
      setCurrentPageById,
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
