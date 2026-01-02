# Telegram Markdown to HTML Converter

A smart and efficient TypeScript/JavaScript library for converting Telegram-style Markdown to Telegram-compatible HTML. Perfect for Telegram bots, chat applications, and content processing.

[![npm version](https://img.shields.io/npm/v/telegram-md2html.svg)](https://www.npmjs.com/package/telegram-md2html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm downloads](https://img.shields.io/npm/dm/telegram-md2html.svg)](https://www.npmjs.com/package/telegram-md2html)

## Features

- **Complete Telegram Markdown Support**: All Telegram-specific formatting options
- **Smart Parsing**: Handles nested styles and complex formatting
- **HTML Safety**: Automatic escaping of HTML special characters
- **Code Block Support**: Inline code and multiline code blocks with language specification
- **Blockquote Support**: Regular and expandable blockquotes
- **Customizable**: Extensible with custom processors
- **TypeScript Ready**: Full TypeScript definitions included
- **Dual Module Support**: Works with both CommonJS and ES Modules
- **Browser Compatible**: Can be used in modern browsers

## Installation

```bash
npm install telegram-md2html
# or
yarn add telegram-md2html
# or
pnpm add telegram-md2html
```

## Quick Start

```javascript
// CommonJS
const { markdownToHtml } = require('telegram-md2html');

// ES Modules
import { markdownToHtml } from 'telegram-md2html';

// Convert Telegram markdown to HTML
const html = markdownToHtml('**Hello** *World*!');
console.log(html);
// Output: <b>Hello</b> <i>World</i>!
```

## Usage Examples

### Basic Conversion

```javascript
import { markdownToHtml } from 'telegram-md2html';

const markdown = `
# Welcome to Telegram Bot

**Bold text** and *italic text*
__Underlined__ and ~~strikethrough~~
||Spoiler text||

\`inline code\`

[Visit Google](https://google.com)

> This is a quote
**> Expandable quote

\`\`\`javascript
console.log("Hello World");
\`\`\`
`;

const html = markdownToHtml(markdown);
console.log(html);
```

### Advanced Usage with Options

```javascript
import { createConverter } from 'telegram-md2html';

// Create a converter with custom options
const converter = createConverter({
  escapeHtml: true,
  autoCloseCodeBlocks: true,
  linkProcessor: (url, text) => 
    `<a href="${url}" target="_blank" rel="noopener">${text}</a>`,
  codeBlockProcessor: (code, language) => 
    `<pre><code class="language-${language || 'text'}">${code}</code></pre>`
});

const html = converter.convert('**[Important Link](https://example.com)**');
```

## Supported Markdown Syntax

| Markdown | HTML Output | Description |
|----------|-------------|-------------|
| `**text**` | `<b>text</b>` | Bold text |
| `*text*` or `_text_` | `<i>text</i>` | Italic text |
| `__text__` | `<u>text</u>` | Underlined text |
| `~~text~~` | `<s>text</s>` | Strikethrough text |
| `\|\|text\|\|` | `<span class="tg-spoiler">text</span>` | Spoiler text |
| `` `code` `` | `<code>code</code>` | Inline code |
| ```` ```language\ncode\n``` ```` | `<pre><code class="language-xxx">code</code></pre>` | Code block |
| `[text](url)` | `<a href="url">text</a>` | Link |
| `> text` | `<blockquote>text</blockquote>` | Blockquote |
| `**> text` | `<blockquote expandable>text</blockquote>` | Expandable blockquote |

## API Reference

### `markdownToHtml(text: string, options?: ConvertOptions): string`

Main conversion function that converts Telegram-style markdown to HTML.

**Parameters:**
- `text`: The markdown text to convert
- `options`: Optional conversion options

**Returns:** Telegram-compatible HTML string

### `createConverter(options?: ConvertOptions): MarkdownConverter`

Creates a converter instance with custom options for reuse.

### ConvertOptions Interface

```typescript
interface ConvertOptions {
  /** Whether to escape HTML special characters (default: true) */
  escapeHtml?: boolean;
  
  /** Whether to auto-close unclosed code blocks (default: true) */
  autoCloseCodeBlocks?: boolean;
  
  /** Custom link processor function */
  linkProcessor?: (url: string, text: string) => string;
  
  /** Custom code block processor function */
  codeBlockProcessor?: (code: string, language?: string) => string;
}
```

## TypeScript Support

The library includes full TypeScript definitions. Just import and use:

```typescript
import { markdownToHtml, ConvertOptions } from 'telegram-md2html';

const options: ConvertOptions = {
  escapeHtml: false,
  linkProcessor: (url: string, text: string): string => {
    return `<a href="${url}" class="custom-link">${text}</a>`;
  }
};

const html: string = markdownToHtml('**TypeScript** works!', options);
```

## Browser Usage

The library can be used in modern browsers:

### Using ES Modules (Recommended)

```html
<script type="module">
  import { markdownToHtml } from 'https://cdn.jsdelivr.net/npm/telegram-md2html/dist/index.mjs';
  
  const html = markdownToHtml('**Hello** from browser!');
  document.getElementById('output').innerHTML = html;
</script>
```

### Using from GitHub

```html
<script type="module">
  import { markdownToHtml } from 'https://cdn.jsdelivr.net/gh/Soumyadeep765/telegram-md2html@main/dist/index.mjs';
  
  const html = markdownToHtml('**Hello** World');
  document.getElementById('output').innerHTML = html;
</script>
```

### Using a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/telegram-md2html/dist/index.js"></script>
<script>
  // Available as window.telegramMd2Html
  const html = telegramMd2Html.markdownToHtml('**CDN** Example');
  document.getElementById('output').innerHTML = html;
</script>
```

### Complex Nested Example

```javascript
const result = markdownToHtml(`
**Welcome to our bot!**

Features:
• *Easy formatting*
• __Multiple styles__
• ~~Clean output~~

\`\`\`python
def greet():
    print("Hello from Python!")
\`\`\`

> Remember: **Formatting** makes messages _better_
**> Click to expand details
`);

console.log(result);
```

## Error Handling

The library handles edge cases gracefully:

- Unclosed code blocks are automatically closed
- HTML characters are properly escaped by default
- Invalid markdown is treated as plain text
- Nested styles are processed correctly

## Performance

The library is optimized for performance:
- Efficient tokenization algorithm
- Minimal memory usage
- No external dependencies
- Fast parsing even for large documents

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Soumyadeep765/telegram-md2html.git
cd telegram-md2html

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Testing

The library includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## License

This project is licensed under the **MIT** License

## Support

If you find this library useful, please consider:

- Starring the repository on GitHub
- Sharing it with others
- Reporting issues
- Suggesting new features

## Changelog

### v1.0.0
- Initial release
- Complete Telegram markdown support
- TypeScript definitions
- Browser compatibility
- Custom processor support

## Author

**Soumyadeep Das**
- GitHub: [@Soumyadeep765](https://github.com/Soumyadeep765)
- Email: soumyadeepdas765@gmail.com

## Acknowledgments

- Telegram for their excellent Bot API
- All contributors and users of this library
- The open source community for inspiration and support

---

**Note**: This library is not affiliated with or endorsed by Telegram.