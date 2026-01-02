import { ConvertOptions } from './types';
export declare class MarkdownConverter {
    private options;
    private hasCustomLinkProcessor;
    private hasCustomCodeBlockProcessor;
    constructor(options?: ConvertOptions);
    /**
     * Convert markdown text to Telegram HTML
     */
    convert(text: string): string;
    /**
     * Recursively convert markdown, handling nested styles
     */
    private convertRecursive;
    /**
     * Wrap token content in HTML tags
     */
    private wrapToken;
    /**
     * Preprocess blockquotes to mark them before other parsing
     */
    private preprocessBlockquotes;
    /**
     * Process blockquote markers
     */
    private processBlockquoteMarkers;
    private defaultLinkProcessor;
    private defaultCodeBlockProcessor;
}
