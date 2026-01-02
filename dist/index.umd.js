(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TelegramMd2Html = {}));
})(this, (function (exports) { 'use strict';

    class MarkdownTokenizer {
        constructor(text) {
            this.text = text;
        }
        /**
         * Tokenize the markdown text
         */
        tokenize() {
            const tokens = [];
            let pos = 0;
            const text = this.text;
            while (pos < text.length) {
                // Skip if inside code block
                if (this.isInsideCodeBlock(text, pos)) {
                    pos++;
                    continue;
                }
                // Try to match each token type (from outermost to innermost)
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
            // Skip if we're inside a quote marker
            if (remaining.startsWith('[QUOTE]') || remaining.startsWith('[EXPANDABLE_QUOTE]')) {
                return null;
            }
            // Match code block (triple backticks) - highest priority
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
            // Match italic with asterisk
            const italicAsteriskMatch = remaining.match(/^\*([^*\n][^*]*?)\*/);
            if (italicAsteriskMatch && italicAsteriskMatch[1].trim().length > 0) {
                // Don't match if it's part of bold (**)
                if (start > 0 && text[start - 1] === '*' && start < text.length - 1 && text[start + 1] === '*') {
                    return null;
                }
                return {
                    type: 'italic',
                    content: italicAsteriskMatch[1],
                    start: start,
                    end: start + italicAsteriskMatch[0].length
                };
            }
            // Match italic with underscore
            const italicUnderscoreMatch = remaining.match(/^_([^_\n]+?)_/);
            if (italicUnderscoreMatch && italicUnderscoreMatch[1].trim().length > 0) {
                // Don't match if it's part of underline (__)
                if (start > 0 && text[start - 1] === '_' && start < text.length - 1 && text[start + 1] === '_') {
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
            // Check for code blocks
            const codeBlockRegex = /```[\s\S]*?```/g;
            let match;
            while ((match = codeBlockRegex.exec(text)) !== null) {
                if (position > match.index && position < match.index + match[0].length) {
                    // But allow matching the closing ``` itself
                    if (position >= match.index + match[0].length - 3) {
                        return false;
                    }
                    return true;
                }
            }
            return false;
        }
        isInsideInlineCode(text, position) {
            // Check for inline code
            const inlineCodeRegex = /`[^`\n]*`/g;
            let match;
            while ((match = inlineCodeRegex.exec(text)) !== null) {
                if (position > match.index && position < match.index + match[0].length) {
                    // But allow matching the closing ` itself
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
            this.options = {
                escapeHtml: options.escapeHtml ?? true,
                autoCloseCodeBlocks: options.autoCloseCodeBlocks ?? true,
                linkProcessor: options.linkProcessor || this.defaultLinkProcessor.bind(this),
                codeBlockProcessor: options.codeBlockProcessor || this.defaultCodeBlockProcessor.bind(this)
            };
        }
        /**
         * Convert markdown text to Telegram HTML
         */
        convert(text) {
            // Auto-close code blocks if enabled
            let processedText = this.options.autoCloseCodeBlocks
                ? autoCloseCodeBlocks(text)
                : text;
            // First pass: convert blockquotes (they should be at line starts)
            processedText = this.preprocessBlockquotes(processedText);
            // Convert the text recursively
            let result = this.convertRecursive(processedText);
            // Process blockquote markers
            result = this.processBlockquoteMarkers(result);
            // Only trim if there's actual content (not just whitespace)
            if (result.trim() === '') {
                return text; // Return original text (spaces) if result is empty
            }
            return result.trim();
        }
        /**
         * Recursively convert markdown, handling nested styles
         */
        convertRecursive(text, depth = 0) {
            if (depth > 10)
                return text; // Prevent infinite recursion
            // Tokenize the text
            const tokenizer = new MarkdownTokenizer(text);
            const tokens = tokenizer.tokenize();
            // If no tokens found, return the text as-is (with HTML escaping)
            if (tokens.length === 0) {
                return this.options.escapeHtml ? escapeTelegramHtml(text) : text;
            }
            let result = '';
            let lastPos = 0;
            for (const token of tokens) {
                // Add text before token
                if (token.start > lastPos) {
                    const textBefore = text.slice(lastPos, token.start);
                    result += this.options.escapeHtml ? escapeTelegramHtml(textBefore) : textBefore;
                }
                // Handle code blocks specially (no recursive parsing inside)
                if (token.type === 'code_block') {
                    const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
                    result += this.wrapToken(token.type, codeContent, token.language);
                    lastPos = token.end;
                    continue;
                }
                // Handle inline code specially (no recursive parsing inside)
                if (token.type === 'inline_code') {
                    const codeContent = this.options.escapeHtml ? escapeHtml(token.content) : token.content;
                    result += `<code>${codeContent}</code>`;
                    lastPos = token.end;
                    continue;
                }
                // Process other token content recursively
                const tokenContent = this.convertRecursive(token.content, depth + 1);
                // Wrap the content in appropriate HTML tags
                result += this.wrapToken(token.type, tokenContent, token.language);
                lastPos = token.end;
            }
            // Add remaining text
            if (lastPos < text.length) {
                const remainingText = text.slice(lastPos);
                result += this.options.escapeHtml ? escapeTelegramHtml(remainingText) : remainingText;
            }
            return result;
        }
        /**
         * Wrap token content in HTML tags
         */
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
                    // Already handled above
                    return `<code>${content}</code>`;
                case 'code_block':
                    // Already handled above, but handle custom processor
                    if (this.hasCustomCodeBlockProcessor) {
                        return this.options.codeBlockProcessor(content, language);
                    }
                    const escapedCode = this.options.escapeHtml ? escapeHtml(content) : content;
                    const langAttr = language ? ` class="language-${language}"` : '';
                    return `\n<pre><code${langAttr}>${escapedCode}</code></pre>\n`;
                case 'link':
                    const url = language || '';
                    if (this.hasCustomLinkProcessor) {
                        return this.options.linkProcessor(url, content);
                    }
                    const escapedUrl = this.options.escapeHtml ? escapeHtml(url) : url;
                    const escapedText = this.options.escapeHtml ? escapeHtml(content) : content;
                    return `<a href="${escapedUrl}">${escapedText}</a>`;
                case 'quote':
                    return `\n<blockquote>${content.trim()}</blockquote>\n`;
                case 'expandable_quote':
                    return `\n<blockquote expandable>${content.trim()}</blockquote>\n`;
                default:
                    return content;
            }
        }
        /**
         * Preprocess blockquotes to mark them before other parsing
         */
        preprocessBlockquotes(text) {
            const lines = text.split('\n');
            const processedLines = [];
            for (const line of lines) {
                const trimmedLine = line.trim();
                // Only treat lines starting with > at the beginning of line as blockquotes
                if (trimmedLine.startsWith('**>')) {
                    // Expandable blockquote
                    const content = trimmedLine.substring(3).trim();
                    processedLines.push(`[EXPANDABLE_QUOTE]${content}`);
                }
                else if (trimmedLine.startsWith('>')) {
                    // Regular blockquote
                    const content = trimmedLine.substring(1).trim();
                    processedLines.push(`[QUOTE]${content}`);
                }
                else {
                    processedLines.push(line);
                }
            }
            return processedLines.join('\n');
        }
        /**
         * Process blockquote markers
         */
        processBlockquoteMarkers(text) {
            let result = text;
            // Replace expandable quote markers (process content recursively)
            const expandableQuoteRegex = /\[EXPANDABLE_QUOTE\](.*?)(?=\n|$)/g;
            result = result.replace(expandableQuoteRegex, (match, content) => {
                const processedContent = this.convertRecursive(content);
                return `\n<blockquote expandable>${processedContent.trim()}</blockquote>\n`;
            });
            // Replace regular quote markers (process content recursively)
            const quoteRegex = /\[QUOTE\](.*?)(?=\n|$)/g;
            result = result.replace(quoteRegex, (match, content) => {
                const processedContent = this.convertRecursive(content);
                return `\n<blockquote>${processedContent.trim()}</blockquote>\n`;
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
            return `\n<pre><code${langAttr}>${escapedCode}</code></pre>\n`;
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

    Object.defineProperty(exports, '__esModule', { value: true });

}));
