import { markdownToHtml, createConverter } from './dist/index.mjs';

// Basic usage
const html1 = markdownToHtml('**Bold** and *italic* text');
console.log('✅ TypeScript test 1:', html1);

// With options
const html2 = markdownToHtml('<script>alert("xss")</script>', { escapeHtml: false });
console.log('✅ TypeScript test 2:', html2);

// Custom converter
const converter = createConverter({
  linkProcessor: (url, text) => `<a href="${url}" class="custom-link">${text}</a>`
});
const html3 = converter.convert('[Click here](https://example.com)');
console.log('✅ TypeScript test 3:', html3);
