import { Token } from './types';
export declare class MarkdownTokenizer {
    private text;
    constructor(text: string);
    /**
     * Tokenize the markdown text
     */
    tokenize(): Token[];
    private matchToken;
    private isInsideCodeBlock;
    private isInsideInlineCode;
}
