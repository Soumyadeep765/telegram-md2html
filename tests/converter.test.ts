import { markdownToHtml, createConverter } from '../src/index';

describe('Telegram Markdown to HTML Converter', () => {
  test('converts bold text', () => {
    expect(markdownToHtml('**bold**')).toBe('<b>bold</b>');
  });
  
  test('converts italic text with asterisk', () => {
    expect(markdownToHtml('*italic*')).toBe('<i>italic</i>');
  });
  
  test('converts italic text with underscore', () => {
    expect(markdownToHtml('_italic_')).toBe('<i>italic</i>');
  });
  
  test('converts underline text', () => {
    expect(markdownToHtml('__underline__')).toBe('<u>underline</u>');
  });
  
  test('converts strikethrough text', () => {
    expect(markdownToHtml('~~strikethrough~~')).toBe('<s>strikethrough</s>');
  });
  
  test('converts spoiler text', () => {
    expect(markdownToHtml('||spoiler||')).toBe('<span class="tg-spoiler">spoiler</span>');
  });
  
  test('converts inline code', () => {
    expect(markdownToHtml('`code`')).toBe('<code>code</code>');
  });
  
  test('converts links', () => {
    expect(markdownToHtml('[Google](https://google.com)')).toBe(
      '<a href="https://google.com">Google</a>'
    );
  });
  
  test('converts code blocks', () => {
    const result = markdownToHtml('```js\nconsole.log("hello");\n```');
    expect(result).toContain('<pre><code class="language-js">');
  });
  
  test('converts regular blockquote', () => {
    expect(markdownToHtml('> quote text')).toBe('\n<blockquote>quote text</blockquote>\n');
  });
  
  test('converts expandable blockquote', () => {
    expect(markdownToHtml('**> expandable quote')).toBe('\n<blockquote expandable>expandable quote</blockquote>\n');
  });
  
  test('handles nested styles', () => {
    expect(markdownToHtml('**bold and _italic_**')).toBe('<b>bold and <i>italic</i></b>');
  });
  
  test('escapes HTML characters', () => {
    expect(markdownToHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });
  
  test('auto-closes code blocks', () => {
    const result = markdownToHtml('```js\nconsole.log("open block');
    expect(result).toContain('</code></pre>');
  });
  
  test('allows custom link processor', () => {
    const converter = createConverter({
      linkProcessor: (url, text) => `<a href="${url}" target="_blank">${text}</a>`
    });
    const result = converter.convert('[Google](https://google.com)');
    expect(result).toBe('<a href="https://google.com" target="_blank">Google</a>');
  });
});