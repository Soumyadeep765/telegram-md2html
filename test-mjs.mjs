import { markdownToHtml } from './dist/index.mjs';

const html = markdownToHtml('**Hello** from ES Module!');
console.log('✅ ES Module test:', html);
