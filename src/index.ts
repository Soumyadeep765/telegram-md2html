import { MarkdownConverter } from './converter.js';
import { ConvertOptions } from './types.js';

/**
 * Convert Telegram-style Markdown to HTML
 * @param text - Markdown text to convert
 * @param options - Conversion options
 * @returns Telegram-compatible HTML
 */
export function markdownToHtml(text: string, options ? : ConvertOptions): string {
  const converter = new MarkdownConverter(options);
  return converter.convert(text);
}

/**
 * Create a converter instance with custom options
 */
export function createConverter(options ? : ConvertOptions): MarkdownConverter {
  return new MarkdownConverter(options);
}

export { MarkdownConverter } from './converter.js';
export type { ConvertOptions, Token } from './types.js';

export default {
  markdownToHtml,
  createConverter,
  MarkdownConverter
};