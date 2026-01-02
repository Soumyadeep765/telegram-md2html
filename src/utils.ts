/**
 * Escapes HTML special characters
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

/**
 * Escapes Telegram HTML special characters
 */
export function escapeTelegramHtml(text: string): string {
  const telegramEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  
  return text.replace(/[&<>"]/g, char => telegramEntities[char] || char);
}

/**
 * Checks if a position is inside a code block or inline code
 */
export function isInsideCode(text: string, position: number): boolean {
  // Check for inline code
  const inlineCodeRegex = /`[^`\n]*`/g;
  let match;
  
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    if (position > match.index && position < match.index + match[0].length) {
      return true;
    }
  }
  
  // Check for code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (position > match.index && position < match.index + match[0].length) {
      return true;
    }
  }
  
  return false;
}

/**
 * Appends missing code block delimiters
 */
export function autoCloseCodeBlocks(text: string): string {
  let result = text;
  const codeBlockRegex = /```/g;
  let matches = Array.from(text.matchAll(codeBlockRegex));
  
  // If odd number of delimiters, add one more
  if (matches.length % 2 === 1) {
    result += '\n```';
  }
  
  return result;
}