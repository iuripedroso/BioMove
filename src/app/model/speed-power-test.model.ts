/**
 * Models do módulo de testes de Agilidade (Capítulo 2 do livro
 * "101 Performance Evaluation Tests", Brian Mackenzie, 2005).
 *
 * Segue a mesma ideia do módulo de Endurance: cada teste é descrito de forma
 * genérica (metadados + campos de entrada) para que uma única página
 * (`SpeedPowerDetailPage`) consiga montar o formulário e mostrar o resultado de
 * qualquer um dos 8 testes, sem precisar de uma página dedicada por teste.
 */

export interface SpeedPowerTestFieldOption {
  value: string | number;
  label: string;
}

export interface SpeedPowerTestField {
  /** Chave usada no formulário e repassada para o SpeedPowerTestsService.calculate(). */
  key: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  options?: SpeedPowerTestFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  /** Quando presente, o campo vira uma lista de N inputs. */
  repeat?: number;
}

export interface SpeedPowerTestConfig {
  id: string;
  /** Numeração do livro, ex: '2.1' */
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
  fields: SpeedPowerTestField[];
}

export interface SpeedPowerTestResultRow {
  label: string;
  value: string;
}

export interface SpeedPowerTestResult {
  rows: SpeedPowerTestResultRow[];
}
