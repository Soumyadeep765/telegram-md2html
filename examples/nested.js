const { markdownToHtml } = require('telegram-md2html');

// Nested styles work perfectly
const nested = markdownToHtml('**Bold with *italic* inside**');
console.log(nested);
// <b>Bold with <i>italic</i> inside</b>

const complex = markdownToHtml('**Bold, __underline__, and ~~strike~~**');
console.log(complex);
