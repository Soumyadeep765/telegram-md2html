import { Token } from './types';
import { isInsideCode } from './utils';

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
      // Skip if inside code
      if (isInsideCode(text, pos)) {
        pos++;
        continue;
      }
      
      // Try to match each token type
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
    
    // Match code block
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
    if (inlineCodeMatch) {
      return {
        type: 'inline_code',
        content: inlineCodeMatch[1],
        start: start,
        end: start + inlineCodeMatch[0].length
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
    
    // Match italic with asterisk
    const italicAsteriskMatch = remaining.match(/^\*([^*\n]+?)\*/);
    if (italicAsteriskMatch) {
      return {
        type: 'italic',
        content: italicAsteriskMatch[1],
        start: start,
        end: start + italicAsteriskMatch[0].length
      };
    }
    
    // Match italic with underscore
    const italicUnderscoreMatch = remaining.match(/^_([^_\n]+?)_/);
    if (italicUnderscoreMatch) {
      return {
        type: 'italic',
        content: italicUnderscoreMatch[1],
        start: start,
        end: start + italicUnderscoreMatch[0].length
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
    
    // Match link
    const linkMatch = remaining.match(/^\[([^\]]+?)\]\(([^)]+?)\)/);
    if (linkMatch) {
      return {
        type: 'link',
        content: linkMatch[1],
        start: start,
        end: start + linkMatch[0].length,
        language: linkMatch[2] // using language field for URL
      };
    }
    
    // Match expandable blockquote
    const expandableQuoteMatch = remaining.match(/^\*\*>([^\n]+)/);
    if (expandableQuoteMatch) {
      return {
        type: 'expandable_quote',
        content: expandableQuoteMatch[1],
        start: start,
        end: start + expandableQuoteMatch[0].length
      };
    }
    
    // Match regular blockquote
    const quoteMatch = remaining.match(/^>([^\n]+)/);
    if (quoteMatch) {
      return {
        type: 'quote',
        content: quoteMatch[1],
        start: start,
        end: start + quoteMatch[0].length
      };
    }
    
    return null;
  }
}