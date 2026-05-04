import { WorkspacePage, CreatePageData } from '../types/page';

const STORAGE_KEY = 'papyrus_pages';
const EXPANDED_PAGES_KEY = 'papyrus_expanded_pages';
const CURRENT_PAGE_KEY = 'papyrus_current_page';

export class PageStorage {
  // Generate a unique ID for pages
  static generateId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Load all pages from localStorage
  static loadPages(): WorkspacePage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const pages = JSON.parse(stored);
      return Array.isArray(pages) ? pages : [];
    } catch (error) {
      console.error('Failed to load pages from storage:', error);
      return [];
    }
  }

  // Save all pages to localStorage
  static savePages(pages: WorkspacePage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch (error) {
      console.error('Failed to save pages to storage:', error);
    }
  }

  // Load expanded pages state
  static loadExpandedPages(): Set<string> {
    try {
      const stored = localStorage.getItem(EXPANDED_PAGES_KEY);
      if (!stored) return new Set();
      
      const expanded = JSON.parse(stored);
      return new Set(Array.isArray(expanded) ? expanded : []);
    } catch (error) {
      console.error('Failed to load expanded pages from storage:', error);
      return new Set();
    }
  }

  // Save expanded pages state
  static saveExpandedPages(expanded: Set<string>): void {
    try {
      localStorage.setItem(EXPANDED_PAGES_KEY, JSON.stringify(Array.from(expanded)));
    } catch (error) {
      console.error('Failed to save expanded pages to storage:', error);
    }
  }

  // Load current page ID
  static loadCurrentPage(): string | null {
    try {
      return localStorage.getItem(CURRENT_PAGE_KEY);
    } catch (error) {
      console.error('Failed to load current page from storage:', error);
      return null;
    }
  }

  // Save current page ID
  static saveCurrentPage(pageId: string): void {
    try {
      localStorage.setItem(CURRENT_PAGE_KEY, pageId);
    } catch (error) {
      console.error('Failed to save current page to storage:', error);
    }
  }

  // Clear current page
  static clearCurrentPage(): void {
    localStorage.removeItem(CURRENT_PAGE_KEY);
  }

  // Create a new page
  static createPage(data?: CreatePageData): WorkspacePage {
    const now = new Date().toISOString();
    const newPage: WorkspacePage = {
      id: this.generateId(),
      title: data?.title || 'Untitled',
      icon: data?.icon || '📄',
      parentId: data?.parentId || null,
      content: data?.content || '',
            isFavorite: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    const pages = this.loadPages();
    pages.push(newPage);
    this.savePages(pages);
    
    return newPage;
  }

  // Update a page
  static updatePage(id: string, updates: Partial<WorkspacePage>): WorkspacePage | null {
    const pages = this.loadPages();
    const pageIndex = pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) return null;

    pages[pageIndex] = {
      ...pages[pageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.savePages(pages);
    return pages[pageIndex];
  }

  // Delete a page (also deletes all children)
  static deletePage(id: string): boolean {
    const pages = this.loadPages();
    const pageIdsToDelete = [id, ...this.getAllDescendantIds(pages, id)];
    
    const filteredPages = pages.filter(p => !pageIdsToDelete.includes(p.id));
    
    if (filteredPages.length === pages.length) return false;

    this.savePages(filteredPages);
    return true;
  }

  // Archive a page
  static archivePage(id: string): boolean {
    return this.updatePage(id, { isArchived: true }) !== null;
  }

  // Get all descendant IDs for a given page
  static getAllDescendantIds(pages: WorkspacePage[], parentId: string): string[] {
    const children = pages.filter(p => p.parentId === parentId);
    const descendantIds: string[] = [];
    
    for (const child of children) {
      descendantIds.push(child.id);
      descendantIds.push(...this.getAllDescendantIds(pages, child.id));
    }
    
    return descendantIds;
  }

  // Duplicate a page
  static duplicatePage(id: string): WorkspacePage | null {
    const pages = this.loadPages();
    const originalPage = pages.find(p => p.id === id);
    
    if (!originalPage) return null;

    const now = new Date().toISOString();
    const duplicatedPage: WorkspacePage = {
      ...originalPage,
      id: this.generateId(),
      title: `${originalPage.title} (copy)`,
      createdAt: now,
      updatedAt: now,
    };

    pages.push(duplicatedPage);
    this.savePages(pages);
    
    return duplicatedPage;
  }

  // Seed with starter pages if empty
  static seedStarterPages(): void {
    const existingPages = this.loadPages();
    if (existingPages.length > 0) return;

    const starterPages: Omit<WorkspacePage, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Welcome to Papyrus',
        icon: '🏠',
        parentId: null,
        content: '<h1>Welcome to Papyrus</h1><p>Your focused workspace for organized notes and pages.</p><h2>Getting Started</h2><ul><li>Create new pages with the "New Page" button</li><li>Nest pages to organize your thoughts</li><li>Use the editor to write and format content</li><li>Favorite important pages for quick access</li></ul>',
        isFavorite: true,
        isArchived: false,
      },
      {
        title: 'Project Ideas',
        icon: '💡',
        parentId: null,
        content: '<h1>Project Ideas</h1><p>A place to capture and develop your project concepts.</p><h2>Current Ideas</h2><ul><li></li><li></li><li></li></ul>',
        isFavorite: false,
        isArchived: false,
      },
      {
        title: 'Meeting Notes',
        icon: '📝',
        parentId: null,
        content: '<h1>Meeting Notes</h1><p>Keep track of important discussions and decisions.</p><h2>Recent Meetings</h2><ul><li></li><li></li></ul>',
        isFavorite: false,
        isArchived: false,
      },
      {
        title: 'Web App Redesign',
        icon: '🎨',
        parentId: 'Project Ideas',
        content: '<h1>Web App Redesign</h1><h2>Goals</h2><ul><li>Improve user experience</li><li>Modern UI design</li><li>Better performance</li></ul><h2>Timeline</h2><p>Q2 2026</p>',
        isFavorite: false,
        isArchived: false,
      },
    ];

    const now = new Date().toISOString();
    const newPages: WorkspacePage[] = starterPages.map(page => ({
      ...page,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    this.savePages(newPages);
  }
}
