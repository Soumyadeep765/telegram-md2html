/**
 * Escapes HTML special characters (but not double-escape)
 */
export declare function escapeHtml(text: string): string;
/**
 * Escapes Telegram HTML special characters
 */
export declare function escapeTelegramHtml(text: string): string;
/**
 * Checks if a position is inside a code block
 */
export declare function isInsideCodeBlock(text: string, position: number): boolean;
/**
 * Checks if a position is inside inline code
 */
export declare function isInsideInlineCode(text: string, position: number): boolean;
/**
 * Checks if a position is inside any code
 */
export declare function isInsideCode(text: string, position: number): boolean;
/**
 * Appends missing code block delimiters
 */
export declare function autoCloseCodeBlocks(text: string): string;
