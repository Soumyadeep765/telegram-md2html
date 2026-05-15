'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class MarkdownTokenizer {
    constructor(text) {
        this.text = text;
    }
    tokenize() {
        const tokens = [];
        let pos = 0;
        const text = this.text;
        while (pos < text.length) {
            if (this.isInsideCodeBlock(text, pos)) {
                pos++;
                continue;
            }
            const token = this.matchToken(pos);
            if (token) {
                tokens.push(token);
                pos = token.end;
            }
            else {
                pos++;
            }
        }
        return tokens.sort((a, b) => a.start - b.start);
    }
    matchToken(start) {
        const text = this.text;
        const remaining = text.slice(start);
        if (remaining.startsWith('[QUOTE]') || remaining.startsWith('[EXPANDABLE_QUOTE]')) {
            return null;
        }
        // Match headings (###, ##)
        const headingMatch = remaining.match(/^(#{1,3})\s+(.+?)(?=\n|$)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            return {
                type: `heading_${level}`,
                content: content,
                start: start,
                end: start + headingMatch[0].length
            };
        }
        // Match code block (triple backticks)
        const codeBlockMatch = remaining.match(/^```(\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            return {
                type: 'code_block',
                content: codeBlockMatch[2],
                language: codeBlockMatch[1],
                start: start,
                end: start + codeBlockMatch[0].length
            };
        }
        // Match inline code
        const inlineCodeMatch = remaining.match(/^`([^`\n]+)`/);
        if (inlineCodeMatch && !this.isInsideInlineCode(text, start)) {
            return {
                type: 'inline_code',
                content: inlineCodeMatch[1],
                start: start,
                end: start + inlineCodeMatch[0].length
            };
        }
        // Match spoiler
        const spoilerMatch = remaining.match(/^\|\|([^|\n]+?)\|\|/);
        if (spoilerMatch) {
            return {
                type: 'spoiler',
                content: spoilerMatch[1],
                start: start,
                end: start + spoilerMatch[0].length
            };
        }
        // Match strikethrough
        const strikethroughMatch = remaining.match(/^~~([^~\n]+?)~~/);
        if (strikethroughMatch) {
            return {
                type: 'strikethrough',
                content: strikethroughMatch[1],
                start: start,
                end: start + strikethroughMatch[0].length
            };
        }
        // Match bold
        const boldMatch = remaining.match(/^\*\*([^*\n]+?)\*\*/);
        if (boldMatch) {
            return {
                type: 'bold',
                content: boldMatch[1],
                start: start,
                end: start + boldMatch[0].length
            };
        }
        // Match underline
        const underlineMatch = remaining.match(/^__([^_\n]+?)__/);
        if (underlineMatch) {
            return {
                type: 'underline',
                content: underlineMatch[1],
                start: start,
                end: start + underlineMatch[0].length
            };
        }
        // FIXED: Match italic with asterisk - require space before and after
        const italicAsteriskMatch = remaining.match(/^\*([^*\s][^*]*?[^*\s])\*/);
        if (italicAsteriskMatch && italicAsteriskMatch[1].trim().length > 0) {
            // Don't match if it's part of bold (**)
            if (start > 0 && text[start - 1] === '*' && start < text.length - 1 && text[start + 1] === '*') {
                return null;
            }
            // Check if preceded by alphanumeric or underscore (prevents matching words like *italic* inside words)
            if (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
                return null;
            }
            // Check if followed by alphanumeric or underscore
            const afterMatch = start + italicAsteriskMatch[0].length;
            if (afterMatch < text.length && /[a-zA-Z0-9_]/.test(text[afterMatch])) {
                return null;
            }
            return {
                type: 'italic',
                content: italicAsteriskMatch[1],
                start: start,
                end: start + italicAsteriskMatch[0].length
            };
        }
        // FIXED: Match italic with underscore - require word boundaries and not part of username
        const italicUnderscoreMatch = remaining.match(/^_([^_\s][^_]*?[^_\s])_/);
        if (italicUnderscoreMatch && italicUnderscoreMatch[1].trim().length > 0) {
            // Don't match if it's part of underline (__)
            if (start > 0 && text[start - 1] === '_' && start < text.length - 1 && text[start + 1] === '_') {
                return null;
            }
            // FIXED: Don't match if preceded by @ (username) or alphanumeric
            if (start > 0) {
                const prevChar = text[start - 1];
                if (prevChar === '@' || /[a-zA-Z0-9]/.test(prevChar)) {
                    return null;
                }
            }
            // Don't match if followed by alphanumeric (part of word)
            const afterMatch = start + italicUnderscoreMatch[0].length;
            if (afterMatch < text.length && /[a-zA-Z0-9]/.test(text[afterMatch])) {
                return null;
            }
            return {
                type: 'italic',
                content: italicUnderscoreMatch[1],
                start: start,
                end: start + italicUnderscoreMatch[0].length
            };
        }
        // Match link
        const linkMatch = remaining.match(/^\[([^\]]+?)\]\(([^)]+?)\)/);
        if (linkMatch) {
            return {
                type: 'link',
                content: linkMatch[1],
                start: start,
                end: start + linkMatch[0].length,
                language: linkMatch[2]
            };
        }
        return null;
    }
    isInsideCodeBlock(text, position) {
        const codeBlockRegex = /```[\s\S]*?```/g;
        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            if (position > match.index && position < match.index + match[0].length) {
                if (position >= match.index + match[0].length - 3) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
    isInsideInlineCode(text, position) {
        const inlineCodeRegex = /`[^`\n]*`/g;
        let match;
        while ((match = inlineCodeRegex.exec(text)) !== null) {
            if (position > match.index && position < match.index + match[0].length) {
                if (position === match.index + match[0].length - 1) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
}

/**
 * Escapes HTML special characters (but not double-escape)
 */
function escapeHtml(text) {
    if (!text)
        return text;
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
function escapeTelegramHtml(text) {
    if (!text)
        return text;
    // For Telegram, we only need to escape &, <, >, and "
    let result = text.replace(/&(?!#?\w+;)/g, '&amp;');
    result = result.replace(/</g, '&lt;');
    result = result.replace(/>/g, '&gt;');
    result = result.replace(/"/g, '&quot;');
    return result;
}
/**
 * Appends missing code block delimiters
 */
function autoCloseCodeBlocks(text) {
    // Count triple backticks
    const tripleBacktickCount = (text.match(/```/g) || []).length;
    // If odd number, add closing backticks
    if (tripleBacktickCount % 2 === 1) {
        return text + '\n```';
    }
    return text;
}

class MarkdownConverter {
    constructor(options = {}) {
        this.hasCustomLinkProcessor = !!options.linkProcessor;
        this.hasCustomCodeBlockProcessor = !!options.codeBlockProcessor;
        // Fixed: Add heading symbol option (default: '▎')
        this.headingSymbol = options.headingSymbol ?? '▎';
        this.options = {
            escapeHtml: options.escapeHtml ?? true,
            autoCloseCodeBlocks: options.autoCloseCodeBlocks ?? true,
            headingSymbol: options.headingSymbol ?? '▎',
            headingBlank: options.headingBlank ?? false,
            linkProcessor: options.linkProcessor || this.defaultLinkProcessor.bind(this),
            codeBlockProcessor: options.codeBlockProcessor || this.defaultCodeBlockProcessor.bind(this)
        };
    }
    convert(text) {
        let processedText = this.options.autoCloseCodeBlocks
            ? autoCloseCodeBlocks(text)
            : text;
        processedText = this.preprocessBlockquotes(processedText);
        let result = this.convertRecursive(processedText);
        result = this.processBlockquoteMarkers(result);
        if (result.trim() === '') {
            return text;
        }
        return result.trim();
    }
    convertRecursive(text, depth = 0) {
        if (depth > 10)
            return text;
        const tokenizer = new MarkdownTokenizer(text);
        const tokens = tokenizer.tokenize();
        if (tokens.length === 0) {
            return this.options.escapeHtml ? escapeTelegramHtml(text) : text;
        }
        let result = '';
        let lastPos = 0;
        for (const token of tokens) {
            if (token.start > lastPos) {
                const textBefore = text.slice(lastPos, token.start);
                result += this.options.escapeHtml ? escapeTelegramHtml(textBefore) : textBefore;
            }
            // Fixed: Handle headings
            if (token.type === 'heading_2' || token.type === 'heading_3') {
                token.type === 'heading_2' ? '##' : '###';
                const processedContent = this.convertRecursive(token.content, depth + 1);
                // Fixed: Add symbol and bold styling
                const symbol = this.options.headingBlank ? '' : this.headingSymbol;
                const headingText = symbol ? `${symbol} ${processedContent}` : processedContent;
                result += `<b>${headingText}</b>`;
                lastPos = token.end;
                continue;
            }
            if (token.type === 'code_block') {
                const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
                result += this.wrapToken(token.type, codeContent, token.language);
                lastPos = token.end;
                continue;
            }
            if (token.type === 'inline_code') {
                const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
                result += `<code>${codeContent}</code>`;
                lastPos = token.end;
                continue;
            }
            const tokenContent = this.convertRecursive(token.content, depth + 1);
            result += this.wrapToken(token.type, tokenContent, token.language);
            lastPos = token.end;
        }
        if (lastPos < text.length) {
            const remainingText = text.slice(lastPos);
            result += this.options.escapeHtml ? escapeTelegramHtml(remainingText) : remainingText;
        }
        return result;
    }
    wrapToken(type, content, language) {
        switch (type) {
            case 'bold':
                return `<b>${content}</b>`;
            case 'italic':
                return `<i>${content}</i>`;
            case 'underline':
                return `<u>${content}</u>`;
            case 'strikethrough':
                return `<s>${content}</s>`;
            case 'spoiler':
                return `<span class="tg-spoiler">${content}</span>`;
            case 'inline_code':
                return `<code>${content}</code>`;
            case 'code_block':
                if (this.hasCustomCodeBlockProcessor) {
                    return this.options.codeBlockProcessor(content, language);
                }
                const escapedCode = this.options.escapeHtml ? escapeHtml(content) : content;
                const langAttr = language ? ` class="language-${language}"` : '';
                return `<pre><code${langAttr}>${escapedCode}</code></pre>`;
            case 'link':
                const url = language || '';
                if (this.hasCustomLinkProcessor) {
                    return this.options.linkProcessor(url, content);
                }
                const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
                const escapedText = this.options.escapeHtml ? escapeHtml(content) : content;
                return `<a href="${escapedUrl}">${escapedText}</a>`;
            case 'quote':
                return `<blockquote>${content.trim()}</blockquote>`;
            case 'expandable_quote':
                return `<blockquote expandable>${content.trim()}</blockquote>`;
            default:
                return content;
        }
    }
    preprocessBlockquotes(text) {
        const lines = text.split('\n');
        const processedLines = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('**>')) {
                const content = trimmedLine.substring(3).trim();
                processedLines.push(`[EXPANDABLE_QUOTE]${content}`);
            }
            else if (trimmedLine.startsWith('>')) {
                const content = trimmedLine.substring(1).trim();
                processedLines.push(`[QUOTE]${content}`);
            }
            else {
                processedLines.push(line);
            }
        }
        return processedLines.join('\n');
    }
    processBlockquoteMarkers(text) {
        let result = text;
        const expandableQuoteRegex = /\[EXPANDABLE_QUOTE\](.*?)(?=\n|$)/g;
        result = result.replace(expandableQuoteRegex, (match, content) => {
            const processedContent = this.convertRecursive(content);
            return `<blockquote expandable>${processedContent.trim()}</blockquote>`;
        });
        const quoteRegex = /\[QUOTE\](.*?)(?=\n|$)/g;
        result = result.replace(quoteRegex, (match, content) => {
            const processedContent = this.convertRecursive(content);
            return `<blockquote>${processedContent.trim()}</blockquote>`;
        });
        return result;
    }
    defaultLinkProcessor(url, text) {
        const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
        const escapedText = this.options.escapeHtml ? escapeHtml(text) : text;
        return `<a href="${escapedUrl}">${escapedText}</a>`;
    }
    defaultCodeBlockProcessor(code, language) {
        const escapedCode = this.options.escapeHtml ? escapeHtml(code) : code;
        const langAttr = language ? ` class="language-${language}"` : '';
        return `<pre><code${langAttr}>${escapedCode}</code></pre>`;
    }
}

/**
 * Convert Telegram-style Markdown to HTML
 * @param text - Markdown text to convert
 * @param options - Conversion options
 * @returns Telegram-compatible HTML
 */
function markdownToHtml(text, options) {
    const converter = new MarkdownConverter(options);
    return converter.convert(text);
}
/**
 * Create a converter instance with custom options
 */
function createConverter(options) {
    return new MarkdownConverter(options);
}
var index = {
    markdownToHtml,
    createConverter,
    MarkdownConverter
};

exports.MarkdownConverter = MarkdownConverter;
exports.createConverter = createConverter;
exports.default = index;
exports.markdownToHtml = markdownToHtml;
