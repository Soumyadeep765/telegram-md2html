import { Token, ConvertOptions } from './types';
import { MarkdownTokenizer } from './tokenizer';
import { escapeHtml, escapeTelegramHtml, autoCloseCodeBlocks } from './utils';

export class MarkdownConverter {
  private options: Required<ConvertOptions>;
  private hasCustomLinkProcessor: boolean;
  private hasCustomCodeBlockProcessor: boolean;
  
  constructor(options: ConvertOptions = {}) {
    this.hasCustomLinkProcessor = !!options.linkProcessor;
    this.hasCustomCodeBlockProcessor = !!options.codeBlockProcessor;
    
    this.options = {
      escapeHtml: options.escapeHtml ?? true,
      autoCloseCodeBlocks: options.autoCloseCodeBlocks ?? true,
      linkProcessor: options.linkProcessor || this.defaultLinkProcessor.bind(this),
      codeBlockProcessor: options.codeBlockProcessor || this.defaultCodeBlockProcessor.bind(this)
    };
  }
  
  /**
   * Convert markdown text to Telegram HTML
   */
  convert(text: string): string {
  // Auto-close code blocks if enabled
  let processedText = this.options.autoCloseCodeBlocks 
    ? autoCloseCodeBlocks(text) 
    : text;
  
  // First pass: convert blockquotes (they should be at line starts)
  processedText = this.preprocessBlockquotes(processedText);
  
  // Convert the text recursively
  let result = this.convertRecursive(processedText);
  
  // Process blockquote markers
  result = this.processBlockquoteMarkers(result);
  
  // Only trim if there's actual content (not just whitespace)
  if (result.trim() === '') {
    return text; // Return original text (spaces) if result is empty
  }
  
  return result.trim();
}
  
  /**
   * Recursively convert markdown, handling nested styles
   */
  private convertRecursive(text: string, depth = 0): string {
    if (depth > 10) return text; // Prevent infinite recursion
    
    // Tokenize the text
    const tokenizer = new MarkdownTokenizer(text);
    const tokens = tokenizer.tokenize();
    
    // If no tokens found, return the text as-is (with HTML escaping)
    if (tokens.length === 0) {
      return this.options.escapeHtml ? escapeTelegramHtml(text) : text;
    }
    
    let result = '';
    let lastPos = 0;
    
    for (const token of tokens) {
      // Add text before token
      if (token.start > lastPos) {
        const textBefore = text.slice(lastPos, token.start);
        result += this.options.escapeHtml ? escapeTelegramHtml(textBefore) : textBefore;
      }
      
      // Handle code blocks specially (no recursive parsing inside)
      if (token.type === 'code_block') {
        const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
        result += this.wrapToken(token.type, codeContent, token.language);
        lastPos = token.end;
        continue;
      }
      
      // Handle inline code specially (no recursive parsing inside)
      if (token.type === 'inline_code') {
        const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
        result += `<code>${codeContent}</code>`;
        lastPos = token.end;
        continue;
      }
      
      // Process other token content recursively
      const tokenContent = this.convertRecursive(token.content, depth + 1);
      
      // Wrap the content in appropriate HTML tags
      result += this.wrapToken(token.type, tokenContent, token.language);
      lastPos = token.end;
    }
    
    // Add remaining text
    if (lastPos < text.length) {
      const remainingText = text.slice(lastPos);
      result += this.options.escapeHtml ? escapeTelegramHtml(remainingText) : remainingText;
    }
    
    return result;
  }
  
  /**
   * Wrap token content in HTML tags
   */
  private wrapToken(type: string, content: string, language?: string): string {
    switch (type) {
      case 'bold':
        return `<b>${content}</b>`;
      
      case 'italic':
        return `<i>${content}</i>`;
      
      case 'underline':
        return `<u>${content}</u>`;
      
      case 'strikethrough':
        return `<s>${content}</s>`;
      
      case 'spoiler':
        return `<span class="tg-spoiler">${content}</span>`;
      
      case 'inline_code':
        // Already handled above
        return `<code>${content}</code>`;
      
      case 'code_block':
        // Already handled above, but handle custom processor
        if (this.hasCustomCodeBlockProcessor) {
          return this.options.codeBlockProcessor(content, language);
        }
        const escapedCode = this.options.escapeHtml ? escapeHtml(content) : content;
        const langAttr = language ? ` class="language-${language}"` : '';
        return `\n<pre><code${langAttr}>${escapedCode}</code></pre>\n`;
      
      case 'link':
        const url = language || '';
        if (this.hasCustomLinkProcessor) {
          return this.options.linkProcessor(url, content);
        }
        const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
        const escapedText = this.options.escapeHtml ? escapeHtml(content) : content;
        return `<a href="${escapedUrl}">${escapedText}</a>`;
      
      case 'quote':
        return `\n<blockquote>${content.trim()}</blockquote>\n`;
      
      case 'expandable_quote':
        return `\n<blockquote expandable>${content.trim()}</blockquote>\n`;
      
      default:
        return content;
    }
  }
  
  /**
   * Preprocess blockquotes to mark them before other parsing
   */
  private preprocessBlockquotes(text: string): string {
    const lines = text.split('\n');
    const processedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Only treat lines starting with > at the beginning of line as blockquotes
      if (trimmedLine.startsWith('**>')) {
        // Expandable blockquote
        const content = trimmedLine.substring(3).trim();
        processedLines.push(`[EXPANDABLE_QUOTE]${content}`);
      } else if (trimmedLine.startsWith('>')) {
        // Regular blockquote
        const content = trimmedLine.substring(1).trim();
        processedLines.push(`[QUOTE]${content}`);
      } else {
        processedLines.push(line);
      }
    }
    
    return processedLines.join('\n');
  }
  
  /**
   * Process blockquote markers
   */
  private processBlockquoteMarkers(text: string): string {
    let result = text;
    
    // Replace expandable quote markers (process content recursively)
    const expandableQuoteRegex = /\[EXPANDABLE_QUOTE\](.*?)(?=\n|$)/g;
    result = result.replace(expandableQuoteRegex, (match, content) => {
      const processedContent = this.convertRecursive(content);
      return `\n<blockquote expandable>${processedContent.trim()}</blockquote>\n`;
    });
    
    // Replace regular quote markers (process content recursively)
    const quoteRegex = /\[QUOTE\](.*?)(?=\n|$)/g;
    result = result.replace(quoteRegex, (match, content) => {
      const processedContent = this.convertRecursive(content);
      return `\n<blockquote>${processedContent.trim()}</blockquote>\n`;
    });
    
    return result;
  }
  
  private defaultLinkProcessor(url: string, text: string): string {
    const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
    const escapedText = this.options.escapeHtml ? escapeHtml(text) : text;
    return `<a href="${escapedUrl}">${escapedText}</a>`;
  }
  
  private defaultCodeBlockProcessor(code: string, language?: string): string {
    const escapedCode = this.options.escapeHtml ? escapeHtml(code) : code;
    const langAttr = language ? ` class="language-${language}"` : '';
    return `\n<pre><code${langAttr}>${escapedCode}</code></pre>\n`;
  }
}