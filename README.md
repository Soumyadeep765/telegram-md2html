# Telegram Markdown to HTML Converter

[![npm version](https://img.shields.io/npm/v/telegram-md2html.svg)](https://www.npmjs.com/package/telegram-md2html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A smart, efficient, and reliable library for converting Telegram-style Markdown to Telegram-compatible HTML. Perfect for Telegram bots, messaging applications, and content processing pipelines.

## ✨ Features

- ✅ **Complete Telegram Markdown Support** - All Telegram-specific formatting
- ✅ **Smart Parsing** - Context-aware (ignores formatting inside code blocks)
- ✅ **Nested Formatting** - Proper handling of nested styles
- ✅ **HTML Safety** - Automatic escaping of HTML special characters
- ✅ **Auto-recovery** - Automatically closes unclosed code blocks
- ✅ **Dual Module Support** - Works with both CommonJS (`require`) and ES Modules (`import`)
- ✅ **TypeScript Ready** - Full type definitions included
- ✅ **Highly Customizable** - Extensible with custom processors
- ✅ **Production Ready** - Minified builds, comprehensive tests
- ✅ **Zero Dependencies** - Lightweight and fast

## 📦 Installation

```bash
npm install telegram-md2html
# or
yarn add telegram-md2html
# or
pnpm add telegram-md2html
```

## 🚀 Quick Start

### Basic Usage

```javascript
// CommonJS
const { markdownToHtml } = require('telegram-md2html');

// ES Modules
import { markdownToHtml } from 'telegram-md2html';

const markdown = '**Bold text** and *italic text* with a [link](https://example.com)';
const html = markdownToHtml(markdown);

console.log(html);
// Output: <b>Bold text</b> and <i>italic text</i> with a <a href="https://example.com">link</a>
```

### Complex Example

```javascript
import { markdownToHtml } from 'telegram-md2html';

const markdown = `
# Welcome to Telegram Bot!

**Important Features:**
• *Italic* and __underline__ formatting
• ~~Strikethrough~~ and ||spoiler|| text
• \`Inline code\` and code blocks:
\`\`\`javascript
function greet() {
    console.log("Hello, Telegram!");
}
\`\`\`

> This is a regular blockquote
**> This is an expandable blockquote

[Learn more](https://core.telegram.org/bots/api#html-style)
`;

const html = markdownToHtml(markdown);
// Send to Telegram bot...
```

## 📚 Supported Syntax

| Markdown Syntax | HTML Output | Description |
|----------------|-------------|-------------|
| `**bold**` | `<b>bold</b>` | Bold text |
| `*italic*` | `<i>italic</i>` | Italic text (asterisk) |
| `_italic_` | `<i>italic</i>` | Italic text (underscore) |
| `__underline__` | `<u>underline</u>` | Underlined text |
| `~~strikethrough~~` | `<s>strikethrough</s>` | Strikethrough text |
| `\|\|spoiler\|\|` | `<span class="tg-spoiler">spoiler</span>` | Spoiler text |
| `` `code` `` | `<code>code</code>` | Inline code |
| ```` ```language\ncode\n``` ```` | `<pre><code class="language-xxx">code</code></pre>` | Code block with syntax highlighting |
| `[text](url)` | `<a href="url">text</a>` | Hyperlink |
| `> quote` | `<blockquote>quote</blockquote>` | Regular blockquote |
| `**> quote` | `<blockquote expandable>quote</blockquote>` | Expandable blockquote |

## ⚙️ Advanced Usage

### Custom Converter with Options

```javascript
import { createConverter } from 'telegram-md2html';

// Create a custom converter with advanced options
const converter = createConverter({
  escapeHtml: true, // Escape HTML special characters (default: true)
  autoCloseCodeBlocks: true, // Auto-close unclosed code blocks (default: true)
  
  // Custom link processor
  linkProcessor: (url, text) => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer">🔗 ${text}</a>`,
  
  // Custom code block processor
  codeBlockProcessor: (code, language) => 
    `<div class="code-container">
       <div class="code-header">${language || 'code'}</div>
       <pre><code>${code}</code></pre>
     </div>`
});

const customHtml = converter.convert('Check [this](https://example.com) out!');
```

### Disable HTML Escaping (Use with Caution)

```javascript
import { markdownToHtml } from 'telegram-md2html';

// For trusted content where you want to preserve existing HTML
const html = markdownToHtml('Mix <b>HTML</b> with **Markdown**', {
  escapeHtml: false
});
// Output: Mix <b>HTML</b> with <b>Markdown</b>
```

## 🔧 API Reference

### `markdownToHtml(text: string, options?: ConvertOptions): string`

Main conversion function that converts Markdown to Telegram HTML.

**Parameters:**
- `text` - The Markdown text to convert
- `options` - Optional conversion settings (see below)

**Returns:** Telegram-compatible HTML string

### `createConverter(options?: ConvertOptions): MarkdownConverter`

Creates a reusable converter instance with custom options.

### `ConvertOptions` Interface

```typescript
interface ConvertOptions {
  /**
   * Whether to escape HTML special characters (&, <, >, ", ')
   * @default true
   */
  escapeHtml?: boolean;
  
  /**
   * Whether to automatically append missing ``` to close code blocks
   * @default true
   */
  autoCloseCodeBlocks?: boolean;
  
  /**
   * Custom processor for links
   * @param url - The URL
   * @param text - The link text
   * @returns HTML string for the link
   */
  linkProcessor?: (url: string, text: string) => string;
  
  /**
   * Custom processor for code blocks
   * @param code - The code content
   * @param language - Optional language specified after ```
   * @returns HTML string for the code block
   */
  codeBlockProcessor?: (code: string, language?: string) => string;
}
```

## 💡 Real-World Examples

### Telegram Bot Integration

```javascript
const { Telegraf } = require('telegraf');
const { markdownToHtml } = require('telegram-md2html');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('format', (ctx) => {
  const markdown = `
**Formatting Examples:**

*Bold*: **bold text**
*Italic*: *italic text* or _italic text_
*Code*: \`inline code\`
*Link*: [Telegram](https://telegram.org)
*Quote*:
> To be or not to be
  `;
  
  // Convert to Telegram HTML
  const html = markdownToHtml(markdown);
  
  // Send as HTML message
  ctx.replyWithHTML(html);
});

bot.launch();
```

### Content Processing Pipeline

```javascript
import { createConverter } from 'telegram-md2html';
import { readFileSync, writeFileSync } from 'fs';

// Process multiple files
const converter = createConverter({
  codeBlockProcessor: (code, language) => `
<details>
  <summary>${language ? `📁 ${language.toUpperCase()}` : '📄 CODE'}</summary>
  <pre><code>${code}</code></pre>
</details>
  `
});

const input = readFileSync('document.md', 'utf-8');
const output = converter.convert(input);
writeFileSync('document.html', output);
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🔍 How It Works

The library uses a sophisticated tokenizer that:
1. Scans the text for Markdown patterns
2. Intelligently ignores formatting inside code blocks and inline code
3. Processes nested formatting correctly
4. Applies custom processors if provided
5. Escapes HTML characters for security
6. Auto-closes unclosed code blocks

## 📖 Common Use Cases

1. **Telegram Bots** - Format bot responses with rich text
2. **Content Management Systems** - Convert user input to safe HTML
3. **Documentation Tools** - Generate Telegram-compatible documentation
4. **Chat Applications** - Format messages for display
5. **Export Tools** - Convert Markdown to Telegram HTML for export

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/soumyadeep765/telegram-md2html.git
cd telegram-md2html

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Development mode (watch for changes)
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issue Reporting

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/soumyadeep765/telegram-md2html/issues).

## 🙏 Acknowledgments

- Telegram for their awesome Bot API and HTML formatting support
- All contributors who help improve this library

## 📞 Support

For support, questions, or discussions:
- Open an issue on GitHub
- Check the [examples](examples/) directory
- Refer to the [Telegram Bot API documentation](https://core.telegram.org/bots/api#html-style)

---

**Happy coding!** If you find this library useful, please consider giving it a ⭐ on GitHub!