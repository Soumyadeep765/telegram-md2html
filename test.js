const { markdownToHtml } = require('./dist/index.cjs');

const html = markdownToHtml('**Hello** from CommonJS!');
console.log('✅ CommonJS test:', html);
