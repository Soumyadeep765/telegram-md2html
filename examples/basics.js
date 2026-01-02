// CommonJS example
const { markdownToHtml } = require('telegram-md2html');

const markdown = `
**Welcome to Telegram Bot!**

Features:
• *Bold* and _italic_ text
• __Underlined__ and ~~strikethrough~~ text
• ||Spoiler text||
• \`Inline code\`
• [Links](https://telegram.org)

\`\`\`python
def hello():
    print("Hello, Telegram!")
\`\`\`

> Regular quote
**> Expandable quote
`;

console.log('Input Markdown:');
console.log(markdown);
console.log('\nOutput HTML:');
console.log(markdownToHtml(markdown));
