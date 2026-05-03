import { api } from './client';

export async function requestGrammarAssistance(text) {
  const response = await api.post('/ai/grammar', { text });
  return response.data;
}

export async function savePageForSearch({ title, contentHtml, ownerId }) {
  const response = await api.post('/ai/pages', {
    title,
    contentHtml,
    ownerId,
  });
  return response.data;
}

export async function requestSmartSearch({ query, ownerId }) {
  const response = await api.post('/ai/search', {
    query,
    ownerId,
  });
  return response.data;
}
