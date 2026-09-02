import { Injectable } from '@angular/core';
import {
  SportsPsychologyTestConfig,
  SportsPsychologyTestResult,
  SportsPsychologyTestResultRow,
} from '../sports-psychology-test.model';

/**
 * Serviço com a pontuação dos 2 questionários de Psicologia Esportiva
 * (Capítulo 7) do livro "101 Performance Evaluation Tests"
 * (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Nota: os enunciados dos itens são instrumentos publicados (SCAT — Martens;
 * TEOSQ — Duda & Nicholls) e não são reproduzidos aqui. Aplique o
 * questionário oficial ao atleta e lance as respostas nesta calculadora,
 * que implementa apenas o esquema de pontuação.
 */
@Injectable({
  providedIn: 'root',
})
export class SportsPsychologyTestsService {
  // ---------------------------------------------------------------------
  // 7.1 SCAT — Sport Competition Anxiety Test
  // ---------------------------------------------------------------------
  /** Itens que pontuam zero em qualquer resposta. */
  private static readonly SCAT_ZERO_ITEMS = [1, 4, 7, 10, 13];
  /** Itens com pontuação invertida (Raramente = 3 ... Frequentemente = 1). */
  private static readonly SCAT_REVERSED_ITEMS = [6, 11];

  /**
   * Pontua um item do SCAT.
   * @param item número do item (1 a 15)
   * @param answer 1 = Raramente, 2 = Às vezes, 3 = Frequentemente
   */
  scatItemScore(item: number, answer: number): number {
    if (SportsPsychologyTestsService.SCAT_ZERO_ITEMS.includes(item)) { return 0; }
    if (SportsPsychologyTestsService.SCAT_REVERSED_ITEMS.includes(item)) { return 4 - answer; }
    return answer;
  }

  /** Interpretação do escore total do SCAT. */
  scatRating(total: number): string {
    if (total < 17) { return 'Nível baixo de ansiedade'; }
    if (total <= 24) { return 'Nível médio de ansiedade'; }
    return 'Nível alto de ansiedade';
  }

  // ---------------------------------------------------------------------
  // 7.2 TEOSQ — Task and Ego Orientation in Sport Questionnaire
  // ---------------------------------------------------------------------
  /** Itens de orientação ao ego. */
  private static readonly TEOSQ_EGO_ITEMS = [1, 3, 4, 6, 9, 11];
  /** Itens de orientação à tarefa. */
  private static readonly TEOSQ_TASK_ITEMS = [2, 5, 7, 8, 10, 12, 13];

  /** Médias de ego (soma/6) e tarefa (soma/7) a partir das 13 respostas (1-5). */
  teosqScores(answers: Record<number, number>): { ego: number; task: number } {
    const sum = (items: number[]) => items.reduce((acc, i) => acc + (+answers[i] || 0), 0);
    return {
      ego: sum(SportsPsychologyTestsService.TEOSQ_EGO_ITEMS) / 6,
      task: sum(SportsPsychologyTestsService.TEOSQ_TASK_ITEMS) / 7,
    };
  }

  private static readonly SCAT_ANSWER_OPTIONS = [
    { value: 1, label: 'Raramente' },
    { value: 2, label: 'Às vezes' },
    { value: 3, label: 'Frequentemente' },
  ];

  private static readonly LIKERT5_OPTIONS = [
    { value: 1, label: '1 - Discordo totalmente' },
    { value: 2, label: '2 - Discordo' },
    { value: 3, label: '3 - Neutro' },
    { value: 4, label: '4 - Concordo' },
    { value: 5, label: '5 - Concordo totalmente' },
  ];

  /** Metadados dos 2 questionários. */
  getTests(): SportsPsychologyTestConfig[] {
    const scatOptions = SportsPsychologyTestsService.SCAT_ANSWER_OPTIONS;
    const likert = SportsPsychologyTestsService.LIKERT5_OPTIONS;
    return [
      {
        id: 'scat',
        code: '7.1',
        name: 'Sport Competition Anxiety Test (SCAT)',
        objective: 'Avaliar o nível de ansiedade competitiva do atleta.',
        requiredResources: ['Formulário oficial do questionário SCAT (15 itens)', 'Caneta'],
        protocol: [
          'Aplique ao atleta o formulário oficial do SCAT, com os 15 enunciados originais',
          'Para cada item, o atleta indica se se sente assim Raramente, Às vezes ou Frequentemente ao competir',
          'Lance abaixo a resposta dada em cada item, na mesma ordem do formulário',
        ],
        analysisNote:
          'A pontuação segue o gabarito do SCAT: os itens 1, 4, 7, 10 e 13 valem 0; os itens 6 e 11 têm escala invertida; os demais valem de 1 a 3. Total: abaixo de 17 = ansiedade baixa; 17 a 24 = média; acima de 24 = alta.',
        imageUrl: 'assets/tests/sports-psychology/scat.jpg',
        fields: Array.from({ length: 15 }, (_, i) => ({
          key: `q${i + 1}`,
          label: `Item ${i + 1}`,
          type: 'select' as const,
          options: scatOptions,
        })),
      },
      {
        id: 'teosq',
        code: '7.2',
        name: 'TEOSQ – Task and Ego Orientation in Sport Questionnaire',
        objective: 'Avaliar se o atleta define sucesso esportivo como domínio da tarefa ou superação dos outros.',
        requiredResources: ['Formulário oficial do questionário TEOSQ (13 itens)', 'Caneta'],
        protocol: [
          'Peça ao atleta que pense em um momento em que se sentiu mais bem-sucedido no esporte',
          'Aplique o formulário oficial do TEOSQ, com os 13 enunciados originais completando "Sinto-me mais bem-sucedido no esporte quando..."',
          'Cada item é respondido em escala de 1 (discordo totalmente) a 5 (concordo totalmente)',
          'Lance abaixo a resposta dada em cada item, na mesma ordem do formulário',
        ],
        analysisNote:
          'Orientação ao ego: média dos itens 1, 3, 4, 6, 9 e 11. Orientação à tarefa: média dos itens 2, 5, 7, 8, 10, 12 e 13. Cada média varia de 1 (baixa) a 5 (alta).',
        fields: Array.from({ length: 13 }, (_, i) => ({
          key: `q${i + 1}`,
          label: `Item ${i + 1}`,
          type: 'select' as const,
          options: likert,
        })),
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos. */
  calculate(testId: string, values: Record<string, any>): SportsPsychologyTestResult {
    const rows: SportsPsychologyTestResultRow[] = [];

    switch (testId) {
      case 'scat': {
        let total = 0;
        for (let i = 1; i <= 15; i++) {
          total += this.scatItemScore(i, +values[`q${i}`]);
        }
        rows.push({ label: 'Escore SCAT', value: `${total}` });
        rows.push({ label: 'Interpretação', value: this.scatRating(total) });
        break;
      }
      case 'teosq': {
        const answers: Record<number, number> = {};
        for (let i = 1; i <= 13; i++) {
          answers[i] = +values[`q${i}`];
        }
        const { ego, task } = this.teosqScores(answers);
        rows.push({ label: 'Orientação à tarefa (média /7 itens)', value: this.fmt(task) });
        rows.push({ label: 'Orientação ao ego (média /6 itens)', value: this.fmt(ego) });
        rows.push({
          label: 'Leitura',
          value: task >= ego
            ? 'Predomínio da orientação à tarefa (sucesso como domínio/aprendizado)'
            : 'Predomínio da orientação ao ego (sucesso como superar os outros)',
        });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
