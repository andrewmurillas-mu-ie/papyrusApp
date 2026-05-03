import { api } from './client';

export async function requestGrammarAssistance(text) {
  const response = await api.post('/ai/grammar', { text });
  return response.data;
}
