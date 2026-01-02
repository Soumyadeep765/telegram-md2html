import { MarkdownConverter } from './converter.js';
import type { ConvertOptions } from './types.js';
/**
 * Convert Telegram-style Markdown to HTML
 * @param text - Markdown text to convert
 * @param options - Conversion options
 * @returns Telegram-compatible HTML
 */
export declare function markdownToHtml(text: string, options?: ConvertOptions): string;
/**
 * Create a converter instance with custom options
 */
export declare function createConverter(options?: ConvertOptions): MarkdownConverter;
export { MarkdownConverter } from './converter.js';
export type { ConvertOptions, Token } from './types.js';
declare const _default: {
    markdownToHtml: typeof markdownToHtml;
    createConverter: typeof createConverter;
    MarkdownConverter: typeof MarkdownConverter;
};
export default _default;
