/**
 * Representa uma categoria (capítulo do livro "101 Performance Evaluation
 * Tests") de testes físicos. Todos os 8 capítulos estão implementados.
 */
export interface TestCategory {
  /** slug usado nas rotas, ex: 'endurance' */
  id: string;
  /** número do capítulo no livro, ex: '1' */
  code: string;
  name: string;
  description: string;
  /** nome de um ionicon (ex: 'heart-outline') */
  icon: string;
  available: boolean;
  /** total de testes do capítulo, usado no selo do card */
  testCount: number;
  /** cor de destaque da categoria (hex), usada no badge do ícone */
  accent: string;
}
