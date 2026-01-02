const { createConverter } = require('telegram-md2html');

// Custom processor
const converter = createConverter({
  linkProcessor: (url, text) => 
    `<a href="${url}">🔗 ${text}</a>`,

  codeBlockProcessor: (code, lang) =>
    `<pre><code data-lang="${lang || 'text'}">📝 ${code}</code></pre>`
});

const custom = converter.convert(`
Visit [example](https://example.com)

\`\`\`js
console.log("Custom");
\`\`\`
`);

console.log(custom);
