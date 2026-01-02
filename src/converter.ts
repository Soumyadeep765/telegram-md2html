import { Token, ConvertOptions } from './types';
import { MarkdownTokenizer } from './tokenizer';
import { escapeHtml, escapeTelegramHtml, autoCloseCodeBlocks } from './utils';

export class MarkdownConverter {
  private options: Required < ConvertOptions > ;
  
  constructor(options: ConvertOptions = {}) {
    this.options = {
      escapeHtml: options.escapeHtml ?? true,
      autoCloseCodeBlocks: options.autoCloseCodeBlocks ?? true,
      linkProcessor: options.linkProcessor || this.defaultLinkProcessor,
      codeBlockProcessor: options.codeBlockProcessor || this.defaultCodeBlockProcessor
    };
  }
  
  /**
   * Convert markdown text to Telegram HTML
   */
  convert(text: string): string {
    // Auto-close code blocks if enabled
    let processedText = this.options.autoCloseCodeBlocks ?
      autoCloseCodeBlocks(text) :
      text;
    
    // Tokenize the text
    const tokenizer = new MarkdownTokenizer(processedText);
    const tokens = tokenizer.tokenize();
    
    // Build the HTML
    let result = '';
    let lastPos = 0;
    
    for (const token of tokens) {
      // Add text before token
      if (token.start > lastPos) {
        result += this.processPlainText(processedText.slice(lastPos, token.start));
      }
      
      // Process the token
      result += this.processToken(token);
      lastPos = token.end;
    }
    
    // Add remaining text
    if (lastPos < processedText.length) {
      result += this.processPlainText(processedText.slice(lastPos));
    }
    
    // Process blockquotes that might be at line starts
    result = this.processBlockquotes(result);
    
    return result.trim();
  }
  
  private processPlainText(text: string): string {
    if (this.options.escapeHtml) {
      return escapeTelegramHtml(text);
    }
    return text;
  }
  
  private processToken(token: Token): string {
    const escapedContent = this.options.escapeHtml ?
      escapeHtml(token.content) :
      token.content;
    
    switch (token.type) {
      case 'bold':
        return `<b>${escapedContent}</b>`;
        
      case 'italic':
        return `<i>${escapedContent}</i>`;
        
      case 'underline':
        return `<u>${escapedContent}</u>`;
        
      case 'strikethrough':
        return `<s>${escapedContent}</s>`;
        
      case 'spoiler':
        return `<span class="tg-spoiler">${escapedContent}</span>`;
        
      case 'inline_code':
        return `<code>${escapedContent}</code>`;
        
      case 'code_block':
        return this.options.codeBlockProcessor(token.content, token.language);
        
      case 'link':
        return this.options.linkProcessor(token.language!, token.content);
        
      case 'quote':
        return `\n<blockquote>${escapedContent.trim()}</blockquote>\n`;
        
      case 'expandable_quote':
        return `\n<blockquote expandable>${escapedContent.trim()}</blockquote>\n`;
        
      default:
        return escapedContent;
    }
  }
  
  private defaultLinkProcessor(url: string, text: string): string {
    const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
    const escapedText = this.options.escapeHtml ? escapeHtml(text) : text;
    return `<a href="${escapedUrl}">${escapedText}</a>`;
  }
  
  private defaultCodeBlockProcessor(code: string, language ? : string): string {
    const escapedCode = this.options.escapeHtml ? escapeHtml(code) : code;
    const langAttr = language ? ` class="language-${language}"` : '';
    return `\n<pre><code${langAttr}>${escapedCode}</code></pre>\n`;
  }
  
  private processBlockquotes(text: string): string {
    // Process multiline blockquotes
    const lines = text.split('\n');
    const resultLines: string[] = [];
    let inBlockquote = false;
    let blockquoteContent = '';
    
    for (const line of lines) {
      if (line.includes('<blockquote')) {
        if (inBlockquote) {
          blockquoteContent += line + '\n';
        } else {
          if (blockquoteContent) {
            resultLines.push(blockquoteContent.trim());
          }
          blockquoteContent = line + '\n';
          inBlockquote = true;
        }
      } else if (inBlockquote) {
        if (line.trim() === '</blockquote>') {
          blockquoteContent += line;
          resultLines.push(blockquoteContent);
          blockquoteContent = '';
          inBlockquote = false;
        } else {
          blockquoteContent += line + '\n';
        }
      } else {
        if (blockquoteContent) {
          resultLines.push(blockquoteContent.trim());
          blockquoteContent = '';
        }
        resultLines.push(line);
      }
    }
    
    if (blockquoteContent) {
      resultLines.push(blockquoteContent.trim());
    }
    
    return resultLines.join('\n');
  }
}