
/**
 * Escapes HTML special characters (but not double-escape)
 */
export function escapeHtml(text: string): string {
  if (!text) return text;
  
  // Replace & first (but not if it's already an entity)
  let result = text.replace(/&(?!#?\w+;)/g, '&amp;');
  result = result.replace(/</g, '&lt;');
  result = result.replace(/>/g, '&gt;');
  result = result.replace(/"/g, '&quot;');
  result = result.replace(/'/g, '&#39;');
  
  return result;
}

/**
 * Escapes Telegram HTML special characters
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return text;
  
  // For Telegram, we only need to escape &, <, >, and "
  let result = text.replace(/&(?!#?\w+;)/g, '&amp;');
  result = result.replace(/</g, '&lt;');
  result = result.replace(/>/g, '&gt;');
  result = result.replace(/"/g, '&quot;');
  
  return result;
}

/**
 * Checks if a position is inside a code block
 */
export function isInsideCodeBlock(text: string, position: number): boolean {
  // Check for code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (position > match.index && position < match.index + match[0].length) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a position is inside inline code
 */
export function isInsideInlineCode(text: string, position: number): boolean {
  // Check for inline code
  const inlineCodeRegex = /`[^`\n]*`/g;
  let match;
  
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    if (position > match.index && position < match.index + match[0].length) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a position is inside any code
 */
export function isInsideCode(text: string, position: number): boolean {
  return isInsideCodeBlock(text, position) || isInsideInlineCode(text, position);
}

/**
 * Appends missing code block delimiters
 */
export function autoCloseCodeBlocks(text: string): string {
  // Count triple backticks
  const tripleBacktickCount = (text.match(/```/g) || []).length;
  
  // If odd number, add closing backticks
  if (tripleBacktickCount % 2 === 1) {
    return text + '\n```';
  }
  
  return text;
}