import { Token } from './types';

export class MarkdownTokenizer {
  private text: string;
  
  constructor(text: string) {
    this.text = text;
  }
  
  /**
   * Tokenize the markdown text
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let pos = 0;
    const text = this.text;
    
    while (pos < text.length) {
      // Skip if inside code block
      if (this.isInsideCodeBlock(text, pos)) {
        pos++;
        continue;
      }
      
      // Try to match each token type (from outermost to innermost)
      const token = this.matchToken(pos);
      
      if (token) {
        tokens.push(token);
        pos = token.end;
      } else {
        pos++;
      }
    }
    
    return tokens.sort((a, b) => a.start - b.start);
  }
  
  private matchToken(start: number): Token | null {
    const text = this.text;
    const remaining = text.slice(start);
    
    // Skip if we're inside a quote marker
    if (remaining.startsWith('[QUOTE]') || remaining.startsWith('[EXPANDABLE_QUOTE]')) {
      return null;
    }
    
    // Match code block (triple backticks) - highest priority
    const codeBlockMatch = remaining.match(/^```(\w+)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return {
        type: 'code_block',
        content: codeBlockMatch[2],
        language: codeBlockMatch[1],
        start: start,
        end: start + codeBlockMatch[0].length
      };
    }
    
    // Match inline code
    const inlineCodeMatch = remaining.match(/^`([^`\n]+)`/);
    if (inlineCodeMatch && !this.isInsideInlineCode(text, start)) {
      return {
        type: 'inline_code',
        content: inlineCodeMatch[1],
        start: start,
        end: start + inlineCodeMatch[0].length
      };
    }
    
    // Match spoiler
    const spoilerMatch = remaining.match(/^\|\|([^|\n]+?)\|\|/);
    if (spoilerMatch) {
      return {
        type: 'spoiler',
        content: spoilerMatch[1],
        start: start,
        end: start + spoilerMatch[0].length
      };
    }
    
    // Match strikethrough
    const strikethroughMatch = remaining.match(/^~~([^~\n]+?)~~/);
    if (strikethroughMatch) {
      return {
        type: 'strikethrough',
        content: strikethroughMatch[1],
        start: start,
        end: start + strikethroughMatch[0].length
      };
    }
    
    // Match bold
    const boldMatch = remaining.match(/^\*\*([^*\n]+?)\*\*/);
    if (boldMatch) {
      return {
        type: 'bold',
        content: boldMatch[1],
        start: start,
        end: start + boldMatch[0].length
      };
    }
    
    // Match underline
    const underlineMatch = remaining.match(/^__([^_\n]+?)__/);
    if (underlineMatch) {
      return {
        type: 'underline',
        content: underlineMatch[1],
        start: start,
        end: start + underlineMatch[0].length
      };
    }
    
    // Match italic with asterisk
    const italicAsteriskMatch = remaining.match(/^\*([^*\n][^*]*?)\*/);
    if (italicAsteriskMatch && italicAsteriskMatch[1].trim().length > 0) {
      // Don't match if it's part of bold (**)
      if (start > 0 && text[start - 1] === '*' && start < text.length - 1 && text[start + 1] === '*') {
        return null;
      }
      return {
        type: 'italic',
        content: italicAsteriskMatch[1],
        start: start,
        end: start + italicAsteriskMatch[0].length
      };
    }
    
    // Match italic with underscore
    const italicUnderscoreMatch = remaining.match(/^_([^_\n]+?)_/);
    if (italicUnderscoreMatch && italicUnderscoreMatch[1].trim().length > 0) {
      // Don't match if it's part of underline (__)
      if (start > 0 && text[start - 1] === '_' && start < text.length - 1 && text[start + 1] === '_') {
        return null;
      }
      return {
        type: 'italic',
        content: italicUnderscoreMatch[1],
        start: start,
        end: start + italicUnderscoreMatch[0].length
      };
    }
    
    // Match link
    const linkMatch = remaining.match(/^\[([^\]]+?)\]\(([^)]+?)\)/);
    if (linkMatch) {
      return {
        type: 'link',
        content: linkMatch[1],
        start: start,
        end: start + linkMatch[0].length,
        language: linkMatch[2]
      };
    }
    
    return null;
  }
  
  private isInsideCodeBlock(text: string, position: number): boolean {
    // Check for code blocks
    const codeBlockRegex = /```[\s\S]*?```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (position > match.index && position < match.index + match[0].length) {
        // But allow matching the closing ``` itself
        if (position >= match.index + match[0].length - 3) {
          return false;
        }
        return true;
      }
    }
    
    return false;
  }
  
  private isInsideInlineCode(text: string, position: number): boolean {
    // Check for inline code
    const inlineCodeRegex = /`[^`\n]*`/g;
    let match;
    
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (position > match.index && position < match.index + match[0].length) {
        // But allow matching the closing ` itself
        if (position === match.index + match[0].length - 1) {
          return false;
        }
        return true;
      }
    }
    
    return false;
  }
}