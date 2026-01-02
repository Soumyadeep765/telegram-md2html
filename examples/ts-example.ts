import { markdownToHtml, createConverter } from 'telegram-md2html';

// Basic usage
const html = markdownToHtml('__Underline__');
console.log(html); // <u>Underline</u>