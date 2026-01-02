const { markdownToHtml } = require('telegram-md2html');

// Links and code blocks
const message = markdownToHtml(`
Check our [GitHub](https://github.com) for examples.

\`\`\`python
def hello():
    return "Hello Telegram!"
\`\`\`

Use \`inline\` code for short snippets.
`);

console.log(message);
