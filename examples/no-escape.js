const { markdownToHtml } = require('telegram-md2html');

// Disable HTML escaping if needed
const html = markdownToHtml('<b>raw html</b> & symbols', {
  escapeHtml: false
});

console.log(html);
// <b>raw html</b> & symbols
