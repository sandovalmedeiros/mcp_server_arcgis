/**
 * Text Processor Implementation
 *
 * Prepara textos para geração de embeddings e normalização
 */

import type { ITextProcessor } from './text-processor.interface.js';
import type { PublicacaoBase } from '@mcp-server/shared-types';

export class TextProcessor implements ITextProcessor {
  /**
   * Prepara texto para geração de embeddings
   * Combina campos relevantes em um único texto
   */
  prepareText(publicacao: any): string {
    const parts = [
      publicacao.titulo || '',
      publicacao.nome_tema || publicacao.tema || '',
      publicacao.descricao_escala || publicacao.escala || '',
      publicacao.descricao_ano || publicacao.codigo_ano || '',
      this.getContextualTerms(publicacao)
    ].filter(Boolean);

    return parts.join(' | ');
  }

  /**
   * Adiciona termos contextuais baseados no tipo de publicação
   */
  public getContextualTerms(pub: any): string {
    const terms: string[] = [];

    // Verifica se é municipal pelo presence de codmun
    const isMunicipal = pub.codmun !== undefined || pub.tipo === 'municipal';

    if (isMunicipal) {
      terms.push('municipal', 'cidade', 'urbano');
      if (pub.nommun) {
        terms.push(pub.nommun);
      }
    } else {
      // Estadual ou regional
      if (pub.nome_regiao) {
        terms.push(pub.nome_regiao);
      }
      if (pub.nome_tipo_mapa === 'Estadual') {
        terms.push('estadual', 'estado', 'abrangência estadual');
      } else if (pub.nome_tipo_mapa === 'Regional') {
        terms.push('regional', 'região', 'território');
      }
    }

    return terms.join(' ');
  }

  /**
   * Normaliza texto para busca (remove acentos, lowercase)
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')  // Remove acentos
      .replace(/[^\w\s|]/g, '')         // Remove pontuação (exceto |)
      .trim();
  }
}
