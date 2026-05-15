import { Token } from './types';
export declare class MarkdownTokenizer {
    private text;
    constructor(text: string);
    tokenize(): Token[];
    private matchToken;
    private isInsideCodeBlock;
    private isInsideInlineCode;
}
