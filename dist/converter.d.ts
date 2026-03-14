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
     * FIXED: Removed extra newlines that were being added around code blocks and quotes
     * Previously added \n before and after, now returns clean tags without extra whitespace
     */
    private wrapToken;
    /**
     * Preprocess blockquotes to mark them before other parsing
     */
    private preprocessBlockquotes;
    /**
     * Process blockquote markers
     * FIXED: Removed extra newlines from the replacement strings
     */
    private processBlockquoteMarkers;
    private defaultLinkProcessor;
    private defaultCodeBlockProcessor;
}
