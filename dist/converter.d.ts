import { ConvertOptions } from './types';
export declare class MarkdownConverter {
    private options;
    private hasCustomLinkProcessor;
    private hasCustomCodeBlockProcessor;
    private headingSymbol;
    constructor(options?: ConvertOptions);
    convert(text: string): string;
    private convertRecursive;
    private wrapToken;
    private preprocessBlockquotes;
    private processBlockquoteMarkers;
    private defaultLinkProcessor;
    private defaultCodeBlockProcessor;
}
