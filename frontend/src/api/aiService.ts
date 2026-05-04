import { api } from './client';

export interface GrammarSuggestion {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: string[];
}

export interface GrammarResponse {
  correctedText: string;
  cached: boolean;
  cacheAvailable: boolean;
  suggestions: GrammarSuggestion[];
}

export interface SavePageForSearchPayload {
  title: string;
  contentHtml: string;
  ownerId: string;
  sourceKey: string;
}

export interface SavePageForSearchResponse {
  message: string;
  page: {
    id: string;
    title: string;
    sourceKey: string;
    contentText: string;
    updatedAt: string;
  };
}

export interface SmartSearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  updatedAt: string;
}

export interface SmartSearchResponse {
  query: string;
  keywords: string[];
  summary: string;
  results: SmartSearchResult[];
}

export async function requestGrammarAssistance(
  text: string,
): Promise<GrammarResponse> {
  const response = await api.post<GrammarResponse>('/ai/grammar', { text });
  return response.data;
}

export async function savePageForSearch(
  payload: SavePageForSearchPayload,
): Promise<SavePageForSearchResponse> {
  const response = await api.post<SavePageForSearchResponse>('/ai/pages', payload);
  return response.data;
}

export async function requestSmartSearch(payload: {
  query: string;
  ownerId: string;
}): Promise<SmartSearchResponse> {
  const response = await api.post<SmartSearchResponse>('/ai/search', payload);
  return response.data;
}
