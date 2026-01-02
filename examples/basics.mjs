import { markdownToHtml } from 'telegram-md2html';

const result = markdownToHtml('Send **bold** and *italic* messages');
console.log(result);
// <b>bold</b> and <i>italic</i>
