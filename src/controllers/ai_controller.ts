import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AiCache from '../models/ai_cache_model';

interface LanguageToolReplacement {
  value: string;
}

interface LanguageToolMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: LanguageToolReplacement[];
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
}

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function chooseBestReplacement(text: string, match: LanguageToolMatch): string {
  const original = text.slice(match.offset, match.offset + match.length).toLowerCase();
  const replacements = match.replacements.map((item) => item.value);

  if (original === 'was' && replacements.includes('were')) {
    return 'were';
  }

  if (original === 'is' && replacements.includes('are')) {
    return 'are';
  }

  return replacements[0];
}

function applyLanguageToolSuggestions(
  text: string,
  matches: LanguageToolMatch[],
): string {
  const selectedMatches: LanguageToolMatch[] = [];
  const matchesWithSuggestions = matches
    .filter((match) => match.replacements.length > 0)
    .sort((a, b) => a.offset - b.offset);

  for (const match of matchesWithSuggestions) {
    const previous = selectedMatches[selectedMatches.length - 1];

    if (previous) {
      const previousEnd = previous.offset + previous.length;

      if (match.offset <= previousEnd + 2) {
        continue;
      }
    }

    selectedMatches.push(match);
  }

  let correctedText = text;

  for (const match of selectedMatches.sort((a, b) => b.offset - a.offset)) {
    const replacement = chooseBestReplacement(text, match);
    correctedText =
      correctedText.slice(0, match.offset) +
      replacement +
      correctedText.slice(match.offset + match.length);
  }

  return correctedText;
}

function isMongooseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function requestGrammarAssist(req: Request, res: Response): Promise<void> {
  try {
    const rawText = typeof req.body.text === 'string' ? req.body.text : '';
    const text = htmlToPlainText(rawText);

    if (!text) {
      res.status(400).json({ error: 'Text is required for grammar assistance.' });
      return;
    }

    if (text.length > 5000) {
      res.status(400).json({
        error: 'Text is too long. Please send 5000 characters or fewer.',
      });
      return;
    }

    const inputHash = hashText(`grammar-v2:${text}`);
    const cacheAvailable = isMongooseConnected();

    if (cacheAvailable) {
      const cachedResult = await AiCache.findOne({
        feature: 'grammar',
        inputHash,
      });

      if (cachedResult) {
        res.json({
          correctedText: cachedResult.outputText,
          cached: true,
          cacheAvailable: true,
          suggestions: [],
        });
        return;
      }
    }

    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'en-GB');

    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      res.status(502).json({
        error: 'LanguageTool grammar service failed.',
      });
      return;
    }

    const data = (await response.json()) as LanguageToolResponse;
    const correctedText = applyLanguageToolSuggestions(text, data.matches);

    if (cacheAvailable) {
      await AiCache.create({
        feature: 'grammar',
        inputHash,
        inputText: text,
        outputText: correctedText,
      });
    }

    res.json({
      correctedText,
      cached: false,
      cacheAvailable,
      suggestions: data.matches.map((match) => ({
        message: match.message,
        shortMessage: match.shortMessage || '',
        offset: match.offset,
        length: match.length,
        replacements: match.replacements.slice(0, 3).map((item) => item.value),
      })),
    });
  } catch (error) {
    console.error('Grammar assistance failed:', error);
    res.status(500).json({
      error: 'Grammar assistance failed. Check the backend terminal for details.',
    });
  }
}
