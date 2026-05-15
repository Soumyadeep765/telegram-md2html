import { Token, ConvertOptions } from './types';
import { MarkdownTokenizer } from './tokenizer';
import { escapeHtml, escapeTelegramHtml, autoCloseCodeBlocks } from './utils';

export class MarkdownConverter {
  private options: Required<ConvertOptions>;
  private hasCustomLinkProcessor: boolean;
  private hasCustomCodeBlockProcessor: boolean;
  private headingSymbol: string;
  
  constructor(options: ConvertOptions = {}) {
    this.hasCustomLinkProcessor = !!options.linkProcessor;
    this.hasCustomCodeBlockProcessor = !!options.codeBlockProcessor;
    
    // Fixed: Add heading symbol option (default: '▎')
    this.headingSymbol = options.headingSymbol ?? '▎';
    
    this.options = {
      escapeHtml: options.escapeHtml ?? true,
      autoCloseCodeBlocks: options.autoCloseCodeBlocks ?? true,
      headingSymbol: options.headingSymbol ?? '▎',
      headingBlank: options.headingBlank ?? false,
      linkProcessor: options.linkProcessor || this.defaultLinkProcessor.bind(this),
      codeBlockProcessor: options.codeBlockProcessor || this.defaultCodeBlockProcessor.bind(this)
    };
  }
  
  convert(text: string): string {
    let processedText = this.options.autoCloseCodeBlocks 
      ? autoCloseCodeBlocks(text) 
      : text;
    
    processedText = this.preprocessBlockquotes(processedText);
    
    let result = this.convertRecursive(processedText);
    
    result = this.processBlockquoteMarkers(result);
    
    if (result.trim() === '') {
      return text;
    }
    
    return result.trim();
  }
  
  private convertRecursive(text: string, depth = 0): string {
    if (depth > 10) return text;
    
    const tokenizer = new MarkdownTokenizer(text);
    const tokens = tokenizer.tokenize();
    
    if (tokens.length === 0) {
      return this.options.escapeHtml ? escapeTelegramHtml(text) : text;
    }
    
    let result = '';
    let lastPos = 0;
    
    for (const token of tokens) {
      if (token.start > lastPos) {
        const textBefore = text.slice(lastPos, token.start);
        result += this.options.escapeHtml ? escapeTelegramHtml(textBefore) : textBefore;
      }
      
      // Fixed: Handle headings
      if (token.type === 'heading_2' || token.type === 'heading_3') {
        const level = token.type === 'heading_2' ? '##' : '###';
        const processedContent = this.convertRecursive(token.content, depth + 1);
        
        // Fixed: Add symbol and bold styling
        const symbol = this.options.headingBlank ? '' : this.headingSymbol;
        const headingText = symbol ? `${symbol} ${processedContent}` : processedContent;
        
        result += `<b>${headingText}</b>`;
        lastPos = token.end;
        continue;
      }
      
      if (token.type === 'code_block') {
        const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
        result += this.wrapToken(token.type, codeContent, token.language);
        lastPos = token.end;
        continue;
      }
      
      if (token.type === 'inline_code') {
        const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
        result += `<code>${codeContent}</code>`;
        lastPos = token.end;
        continue;
      }
      
      const tokenContent = this.convertRecursive(token.content, depth + 1);
      
      result += this.wrapToken(token.type, tokenContent, token.language);
      lastPos = token.end;
    }
    
    if (lastPos < text.length) {
      const remainingText = text.slice(lastPos);
      result += this.options.escapeHtml ? escapeTelegramHtml(remainingText) : remainingText;
    }
    
    return result;
  }
  
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
        return `<code>${content}</code>`;
      
      case 'code_block':
        if (this.hasCustomCodeBlockProcessor) {
          return this.options.codeBlockProcessor(content, language);
        }
        const escapedCode = this.options.escapeHtml ? escapeHtml(content) : content;
        const langAttr = language ? ` class="language-${language}"` : '';
        return `<pre><code${langAttr}>${escapedCode}</code></pre>`;
      
      case 'link':
        const url = language || '';
        if (this.hasCustomLinkProcessor) {
          return this.options.linkProcessor(url, content);
        }
        const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
        const escapedText = this.options.escapeHtml ? escapeHtml(content) : content;
        return `<a href="${escapedUrl}">${escapedText}</a>`;
      
      case 'quote':
        return `<blockquote>${content.trim()}</blockquote>`;
      
      case 'expandable_quote':
        return `<blockquote expandable>${content.trim()}</blockquote>`;
      
      default:
        return content;
    }
  }
  
  private preprocessBlockquotes(text: string): string {
    const lines = text.split('\n');
    const processedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('**>')) {
        const content = trimmedLine.substring(3).trim();
        processedLines.push(`[EXPANDABLE_QUOTE]${content}`);
      } else if (trimmedLine.startsWith('>')) {
        const content = trimmedLine.substring(1).trim();
        processedLines.push(`[QUOTE]${content}`);
      } else {
        processedLines.push(line);
      }
    }
    
    return processedLines.join('\n');
  }
  
  private processBlockquoteMarkers(text: string): string {
    let result = text;
    
    const expandableQuoteRegex = /\[EXPANDABLE_QUOTE\](.*?)(?=\n|$)/g;
    result = result.replace(expandableQuoteRegex, (match, content) => {
      const processedContent = this.convertRecursive(content);
      return `<blockquote expandable>${processedContent.trim()}</blockquote>`;
    });
    
    const quoteRegex = /\[QUOTE\](.*?)(?=\n|$)/g;
    result = result.replace(quoteRegex, (match, content) => {
      const processedContent = this.convertRecursive(content);
      return `<blockquote>${processedContent.trim()}</blockquote>`;
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
    return `<pre><code${langAttr}>${escapedCode}</code></pre>`;
  }
}