import { markdownToHtml, createConverter } from '../index';

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
    expect(result).toContain('console.log(&quot;hello&quot;);');
  });

  test('converts regular blockquote', () => {
    expect(markdownToHtml('> quote text')).toBe('<blockquote>quote text</blockquote>');
  });

  test('converts expandable blockquote', () => {
    expect(markdownToHtml('**> expandable quote')).toBe('<blockquote expandable>expandable quote</blockquote>');
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
    const result = markdownToHtml('```js\nconsole.log("open block")');
    expect(result).toContain('</code></pre>');
  });

  test('handles mixed content', () => {
    const markdown = '**Bold** and *italic* with `code` and [link](url)';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<b>Bold</b> and <i>italic</i> with <code>code</code> and <a href="url">link</a>');
  });

  test('allows custom link processor', () => {
    const converter = createConverter({
      linkProcessor: (url: string, text: string) => `<a href="${url}" target="_blank">${text}</a>`
    });
    const result = converter.convert('[Google](https://google.com)');
    expect(result).toBe('<a href="https://google.com" target="_blank">Google</a>');
  });

  test('disables HTML escaping when option is false', () => {
    const result = markdownToHtml('<div>test</div>', { escapeHtml: false });
    expect(result).toBe('<div>test</div>');
  });

  test('handles complex nested example', () => {
    const markdown = '**bold _italic_ and `code`**';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<b>bold <i>italic</i> and <code>code</code></b>');
  });

  test('handles multiple paragraphs with blockquotes', () => {
    const markdown = 'First paragraph\n\n> Blockquote line\n> Another line\n\nLast paragraph';
    const result = markdownToHtml(markdown);
    expect(result).toContain('<blockquote>');
    expect(result).toContain('Blockquote line');
    expect(result).toContain('Another line');
  });

  test('preserves newlines', () => {
    const markdown = 'Line 1\nLine 2\nLine 3';
    const result = markdownToHtml(markdown);
    expect(result).toBe('Line 1\nLine 2\nLine 3');
  });

  test('handles empty string', () => {
    expect(markdownToHtml('')).toBe('');
  });

  test('handles text with only spaces', () => {
    expect(markdownToHtml('   ')).toBe('   ');
  });
});