/**
 * Text Processor Interface
 *
 * Define contratos para processamento de texto
 */

export interface ITextProcessor {
  prepareText(publicacao: any): string;
  normalize(text: string): string;
  getContextualTerms(pub: any): string;
}
