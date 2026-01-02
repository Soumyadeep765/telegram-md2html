export interface ConvertOptions {
  /**
   * Whether to escape HTML special characters
   * @default true
   */
  escapeHtml?: boolean;
  
  /**
   * Whether to append missing code block delimiters
   * @default true
   */
  autoCloseCodeBlocks?: boolean;
  
  /**
   * Custom replacement function for links
   */
  linkProcessor?: (url: string, text: string) => string;
  
  /**
   * Custom replacement function for code blocks
   */
  codeBlockProcessor?: (code: string, language?: string) => string;
}

export interface Token {
  type: string;
  content: string;
  start: number;
  end: number;
  language?: string;
  children?: [];
}