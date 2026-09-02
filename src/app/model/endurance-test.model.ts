/**
 * Models do módulo de testes de Endurance (Capítulo 1 do livro
 * "101 Performance Evaluation Tests", Brian Mackenzie, 2005).
 *
 * A ideia é que cada teste seja descrito de forma genérica (metadados +
 * campos de entrada) para que uma única página (`EnduranceDetailPage`)
 * consiga montar o formulário e mostrar o resultado de qualquer um dos
 * 24 testes, sem precisar de uma página dedicada por teste.
 */

export interface EnduranceTestFieldOption {
  value: string | number;
  label: string;
}

export interface EnduranceTestField {
  /** Chave usada no formulário e repassada para o EnduranceTestsService.calculate(). */
  key: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  options?: EnduranceTestFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  /** Quando presente, o campo vira uma lista de N inputs (ex: os 6 tempos do RAST). */
  repeat?: number;
}

export interface EnduranceTestConfig {
  id: string;
  /** Numeração do livro, ex: '1.1' */
  code: string;
  name: string;
  objective: string;
  /** Equipamentos/recursos necessários para aplicar o teste. */
  requiredResources: string[];
  /** Passo a passo de como conduzir o teste. */
  protocol: string[];
  /** Como interpretar o resultado (além do valor calculado). */
  analysisNote: string;
  /** Foto de referência (uso livre) mostrando a execução do teste, se houver. */
  imageUrl?: string;
  fields: EnduranceTestField[];
}

export interface EnduranceTestResultRow {
  label: string;
  value: string;
}

export interface EnduranceTestResult {
  rows: EnduranceTestResultRow[];
}
