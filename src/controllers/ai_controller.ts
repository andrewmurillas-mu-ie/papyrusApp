import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AiCache from '../models/ai_cache_model';
import SearchablePage from '../models/searchable_page_model';

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

function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'of',
    'to',
    'in',
    'on',
    'for',
    'about',
    'with',
    'my',
    'me',
    'find',
    'show',
    'notes',
    'note',
    'page',
    'pages',
  ]);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !stopWords.has(word))
    .slice(0, 8);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSnippet(contentText: string, keywords: string[]): string {
  if (!contentText) return '';

  const lowerContent = contentText.toLowerCase();
  const firstKeyword = keywords.find((keyword) => lowerContent.includes(keyword));

  if (!firstKeyword) {
    return contentText.slice(0, 180);
  }

  const index = lowerContent.indexOf(firstKeyword);
  const start = Math.max(0, index - 70);
  const end = Math.min(contentText.length, index + 140);

  const prefix = start > 0 ? '...' : '';
  const suffix = end < contentText.length ? '...' : '';

  return `${prefix}${contentText.slice(start, end)}${suffix}`;
}

function scorePage(title: string, contentText: string, keywords: string[]): number {
  const lowerTitle = title.toLowerCase();
  const lowerContent = contentText.toLowerCase();

  const matchedKeywords = keywords.filter(
    (keyword) => lowerTitle.includes(keyword) || lowerContent.includes(keyword),
  );

  const uniqueMatchedKeywords = new Set(matchedKeywords);

  const titleMatches = keywords.filter((keyword) => lowerTitle.includes(keyword));
  const contentMatches = keywords.filter((keyword) => lowerContent.includes(keyword));

  return (
    uniqueMatchedKeywords.size * 10 +
    titleMatches.length * 3 +
    contentMatches.length * 2
  );
}

function deriveTitleFromContent(title: string, contentText: string): string {
  const cleanedTitle = title.trim();

  if (cleanedTitle && cleanedTitle.toLowerCase() !== 'untitled page') {
    return cleanedTitle.slice(0, 80);
  }

  const firstSentence = contentText
    .split(/[.!?\n]/)[0]
    ?.trim();

  if (!firstSentence) {
    return 'Untitled page';
  }

  const weakEndingWords = new Set([
    'are',
    'is',
    'was',
    'were',
    'and',
    'or',
    'the',
    'a',
    'an',
    'of',
    'to',
    'in',
    'on',
    'for',
    'with',
  ]);

  const words = firstSentence
    .split(/\s+/)
    .slice(0, 7);

  while (
    words.length > 3 &&
    weakEndingWords.has(words[words.length - 1].toLowerCase())
  ) {
    words.pop();
  }

  const generatedTitle = words.join(' ');

  return generatedTitle || 'Untitled page';
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

export async function requestSaveSearchablePage(req: Request, res: Response): Promise<void> {
  try {
    if (!isMongooseConnected()) {
      res.status(503).json({
        error: 'MongoDB is not connected. Cannot save searchable page right now.',
      });
      return;
    }

    const rawTitle =
      typeof req.body.title === 'string' && req.body.title.trim()
        ? req.body.title.trim()
        : 'Untitled page';

    const contentHtml = typeof req.body.contentHtml === 'string' ? req.body.contentHtml : '';
    const contentText = htmlToPlainText(contentHtml);
    const title = deriveTitleFromContent(rawTitle, contentText);
    const ownerId = typeof req.body.ownerId === 'string' ? req.body.ownerId : '';
    const sourceKey =
      typeof req.body.sourceKey === 'string' && req.body.sourceKey.trim()
        ? req.body.sourceKey.trim()
        : `editor-${ownerId || 'guest'}-default`;

    if (!contentText) {
      res.status(400).json({
        error: 'Page content is required before saving for search.',
      });
      return;
    }

    const page = await SearchablePage.findOneAndUpdate(
      { ownerId, sourceKey },
      {
        $set: {
          title,
          contentHtml,
          contentText,
          ownerId,
          sourceKey,
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!page) {
      res.status(500).json({
        error: 'Could not save searchable page.',
      });
      return;
    }

    res.status(200).json({
      message: 'Page saved for smart search.',
      page: {
        id: page._id,
        title: page.title,
        sourceKey: page.sourceKey,
        contentText: page.contentText,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error) {
    console.error('Saving searchable page failed:', error);
    res.status(500).json({
      error: 'Saving searchable page failed. Check the backend terminal for details.',
    });
  }
}

export async function requestSmartSearch(req: Request, res: Response): Promise<void> {
  try {
    if (!isMongooseConnected()) {
      res.status(503).json({
        error: 'MongoDB is not connected. Smart search needs saved pages in MongoDB.',
      });
      return;
    }

    const query = typeof req.body.query === 'string' ? req.body.query.trim() : '';
    const ownerId = typeof req.body.ownerId === 'string' ? req.body.ownerId : '';

    if (!query) {
      res.status(400).json({
        error: 'Search query is required.',
      });
      return;
    }

    const keywords = extractKeywords(query);

    if (!keywords.length) {
      res.status(400).json({
        error: 'Please use a more specific search query.',
      });
      return;
    }

    const regexes = keywords.map((keyword) => new RegExp(escapeRegex(keyword), 'i'));

    const searchFilter = {
      ...(ownerId ? { ownerId } : {}),
      $or: [
        { title: { $in: regexes } },
        { contentText: { $in: regexes } },
      ],
    };

    const pages = await SearchablePage.find(searchFilter)
      .sort({ updatedAt: -1 })
      .limit(20);

    const results = pages
      .map((page) => ({
        id: page._id,
        title: page.title,
        snippet: buildSnippet(page.contentText, keywords),
        score: scorePage(page.title, page.contentText, keywords),
        updatedAt: page.updatedAt,
      }))
      .filter((page) => page.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const summary = results.length
      ? `Found ${results.length} page(s) related to: ${keywords.join(', ')}. The best match is "${results[0].title}".`
      : `No saved pages matched the important words: ${keywords.join(', ')}.`;

    res.json({
      query,
      keywords,
      summary,
      results,
    });
  } catch (error) {
    console.error('Smart search failed:', error);
    res.status(500).json({
      error: 'Smart search failed. Check the backend terminal for details.',
    });
  }
}
