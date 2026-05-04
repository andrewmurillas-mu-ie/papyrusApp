// Real export functionality for pages

import { saveAs } from 'file-saver';
import TurndownService from 'turndown';
import { jsPDF } from 'jspdf';

// Initialize Turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined'
});

/**
 * Convert HTML content to Markdown format
 */
export function exportToMarkdown(title: string, htmlContent: string): void {
  try {
    const markdown = turndownService.turndown(htmlContent);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${title}.md`);
  } catch (error) {
    console.error('Failed to export to Markdown:', error);
    throw new Error('Failed to export to Markdown');
  }
}

/**
 * Convert HTML content to PDF format
 */
export async function exportToPDF(title: string, htmlContent: string): Promise<void> {
  try {
    // Convert HTML to plain text for PDF
    const textContent = htmlContent
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
      })
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
        let index = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${index++}. $1\n`);
      })
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Create PDF
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(textContent, 180);
    let y = 20;
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(title, 20, y);
    y += 15;
    
    // Add content
    pdf.setFontSize(12);
    lines.forEach((line: string) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += 7;
    });
    
    pdf.save(`${title}.pdf`);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

/**
 * Convert HTML content to DOCX format (simplified version)
 */
export async function exportToDOCX(title: string, htmlContent: string): Promise<void> {
  try {
    // For now, create a simple RTF document that can be opened in Word
    // Full DOCX implementation would require more complex libraries
    const textContent = htmlContent
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
      })
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
        let index = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${index++}. $1\n`);
      })
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Create RTF header
    const rtfHeader = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    const rtfContent = textContent
      .replace(/\n/g, '\\par\n')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const rtfFooter = '}';
    
    const rtfContentFull = `${rtfHeader}\\f0\\fs24 ${title}\\par\\par\\fs20 ${rtfContent}${rtfFooter}`;
    
    const blob = new Blob([rtfContentFull], { 
      type: 'application/rtf' 
    });
    saveAs(blob, `${title}.rtf`);
  } catch (error) {
    console.error('Failed to export to DOCX:', error);
    throw new Error('Failed to export to DOCX');
  }
}
