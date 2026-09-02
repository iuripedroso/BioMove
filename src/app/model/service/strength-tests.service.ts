import { Injectable } from '@angular/core';
import {
  StrengthTestConfig,
  StrengthTestResult,
  StrengthTestResultRow,
} from '../strength-test.model';

/**
 * Serviço com os cálculos dos 28 testes de Força (Capítulo 5) do livro
 * "101 Performance Evaluation Tests" (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Convenções:
 * - Distâncias em metros, tempos em segundos, cargas em kg
 * - 1RM estimado (Brzycki) = carga / (1.0278 − 0.0278 × repetições), reps ≤ 12
 */
@Injectable({
  providedIn: 'root',
})
export class StrengthTestsService {
  // ---------------------------------------------------------------------
  // Helpers de classificação
  // ---------------------------------------------------------------------
  /** Classifica por limiares decrescentes: retorna o rótulo do 1º limiar atingido. */
  private byThresholds(value: number, thresholds: number[], labels: string[], fallback: string): string {
    for (let i = 0; i < thresholds.length; i++) {
      if (value >= thresholds[i]) { return labels[i]; }
    }
    return fallback;
  }

  /** % rank a partir de faixas de tempo (menor tempo = rank maior). */
  private rankFromTimeBands(time: number, bands: [number, number][]): string {
    // bands ordenadas do rank 91-100 (mais rápido) para 1-10 (mais lento)
    if (time < bands[0][0]) { return '91-100 (acima da tabela)'; }
    for (let i = 0; i < bands.length; i++) {
      const [lo, hi] = bands[i];
      if (time >= lo && time <= hi) {
        const low = 91 - i * 10;
        return `${low}-${low + 9}`;
      }
    }
    return '1-10 (abaixo da tabela)';
  }

  // ---------------------------------------------------------------------
  // 5.2 Curl Up Test — limiares por sexo/idade (McArdle et al., 2000)
  // ---------------------------------------------------------------------
  curlUpRating(reps: number, male: boolean, ageBand: string): string {
    const t: Record<string, number[]> = male
      ? { under35: [60, 45, 30, 15], '35to44': [50, 40, 25, 10], over45: [40, 25, 15, 5] }
      : { under35: [50, 40, 25, 10], '35to44': [40, 25, 15, 6], over45: [30, 15, 10, 4] };
    const th = t[ageBand] ?? t['under35'];
    return this.byThresholds(reps, th, ['Excelente', 'Bom', 'Regular', 'Fraco'], 'Muito fraco');
  }

  // ---------------------------------------------------------------------
  // 5.4 Sit Ups Test (30 s) — 16-19 anos (Davis et al., 2000)
  // ---------------------------------------------------------------------
  sitUpsRating(reps: number, male: boolean): string {
    const th = male ? [31, 26, 20, 17] : [26, 21, 15, 9];
    return this.byThresholds(reps, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.5 Jumps Decathlon — fórmulas de pontos por evento
  // ---------------------------------------------------------------------
  jumpsDecathlonPoints(event: string, x: number): number {
    switch (event) {
      case 'slj': return -19.40182 + x * 34.38485 + x * x * -0.636364;
      case 'stj': return -35.50103 + x * 12.53057 + x * x * 0.0344445;
      case 'h2sj': return -45.46265 + x * 12.876771 + x * x * -0.129795;
      case 'h2s2j': return -52.96077 + x * 10.128824 + x * x * -0.018391;
      case 'h2s2j2': return -74.64828 + x * 12.458996 + x * x * -0.174359;
      case 'bunny5': return -68.09148 + x * 12.173418 + x * x * -0.136018;
      case 'sh4j': return -56.97374 + x * 10.563032 + x * x * -0.095043;
      case 'rh4j': return -55.31376 + x * 7.5941124 + x * x * -0.044598;
      case 'hop25': return 99.540643 + x * 4.2533081 + x * x * -1.512287;
      case 'slj5': return -13.07164 + x * 2.9149238 + x * x * 1.73309;
      default: return 0;
    }
  }

  // ---------------------------------------------------------------------
  // 5.6 Leg Strength Test — % rank (D.A. Chu, 1996), hop de 25 m
  // ---------------------------------------------------------------------
  legStrengthRank(timeSeconds: number, male: boolean): string {
    const maleBands: [number, number][] = [
      [2.7, 3.25], [3.36, 3.9], [3.91, 5.0], [5.01, 6.1], [6.11, 7.2],
      [7.21, 7.9], [7.91, 8.4], [8.41, 8.95], [8.96, 9.25], [9.26, 9.6],
    ];
    const femaleBands: [number, number][] = [
      [3.13, 3.75], [3.76, 4.5], [4.51, 5.7], [5.71, 6.9], [6.91, 8.15],
      [8.16, 8.9], [8.91, 9.45], [9.46, 10.05], [10.06, 10.34], [10.35, 10.7],
    ];
    return this.rankFromTimeBands(timeSeconds, male ? maleBands : femaleBands);
  }

  // ---------------------------------------------------------------------
  // 5.7 Standing Long Jump — classificações por faixa
  // ---------------------------------------------------------------------
  standingLongJumpRating(distanceM: number, male: boolean, adult: boolean): string {
    if (adult) {
      const th = male ? [3.0, 2.7, 2.5, 2.3] : [2.8, 2.5, 2.2, 1.9];
      return this.byThresholds(distanceM, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
    }
    const th = male ? [2.01, 1.86, 1.76, 1.65] : [1.66, 1.56, 1.46, 1.35];
    return this.byThresholds(distanceM, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.9 Sergeant Jump — 16-19 anos
  // ---------------------------------------------------------------------
  sergeantJumpRating(distanceCm: number, male: boolean): string {
    const th = male ? [66, 50, 40, 30] : [59, 47, 36, 26];
    return this.byThresholds(distanceCm, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.10 Chin Up — 16-19 anos
  // ---------------------------------------------------------------------
  chinUpRating(reps: number, male: boolean): string {
    const th = male ? [14, 9, 6, 3] : [7, 5, 3, 1];
    return this.byThresholds(reps, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.11 Grip Strength (dinamômetro, kg) — 16-19 anos
  // ---------------------------------------------------------------------
  gripStrengthRating(kg: number, male: boolean): string {
    const th = male ? [57, 51, 45, 39] : [37, 31, 25, 19];
    return this.byThresholds(kg, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.12 Medicine Ball Javelin Quadrathlon — tabelas de pontos (1 a 25)
  // ---------------------------------------------------------------------
  private static readonly MBJQ_TABLES: Record<string, number[]> = {
    st1: [3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    st2: [2, 3.25, 4.5, 5.75, 7, 8.25, 9.5, 10.75, 12, 13, 14, 15, 16, 16.75, 17.5, 18.25, 19, 19.75, 20.5, 21.25, 22, 22.75, 23.5, 24.25, 25],
    ts1: [4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 16.5, 17.5, 18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.75, 28, 28.75, 29.5, 30.25, 31, 31.75],
    ts2: [2.75, 4, 5.25, 6.5, 7.75, 9, 10.25, 11.5, 12.75, 14, 15.25, 16.5, 17.75, 18.5, 19.25, 20, 20.75, 21.5, 22.25, 23, 23.75, 24.5, 25.25, 26, 26.75],
  };

  /** Pontos de um arremesso: maior linha da tabela cuja distância mínima foi atingida. */
  mbjqPoints(event: 'st1' | 'st2' | 'ts1' | 'ts2', distanceM: number): number {
    const table = StrengthTestsService.MBJQ_TABLES[event];
    let points = 0;
    for (let i = 0; i < table.length; i++) {
      if (distanceM >= table[i]) { points = i + 1; }
    }
    return points;
  }

  // ---------------------------------------------------------------------
  // 5.13 Press-ups — classificação por tipo, sexo e idade (Pollock et al., 1984)
  // ---------------------------------------------------------------------
  pressUpsRating(reps: number, fullBody: boolean, ageBand: string): string {
    const full: Record<string, number[]> = {
      '20s': [55, 45, 35, 20], '30s': [45, 35, 25, 15], '40s': [40, 30, 20, 12],
      '50s': [35, 25, 15, 8], '60plus': [30, 20, 10, 5],
    };
    const modified: Record<string, number[]> = {
      '20s': [49, 34, 17, 6], '30s': [40, 25, 12, 4], '40s': [35, 20, 8, 3],
      '50s': [30, 15, 6, 2], '60plus': [20, 5, 3, 1],
    };
    const table = fullBody ? full : modified;
    const th = table[ageBand] ?? table['20s'];
    return this.byThresholds(reps, th, ['Excelente', 'Bom', 'Médio', 'Regular'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.14 / 5.18 — 1RM estimado (Brzycki) e razões força/peso corporal
  // ---------------------------------------------------------------------
  oneRepMax(weightKg: number, reps: number): number {
    return weightKg / (1.0278 - 0.0278 * reps);
  }

  /** Classificação do bench press: 1RM/peso corporal (Cooper Institute, 1997). */
  benchPressRating(ratio: number, male: boolean, ageBand: string): string {
    const male_t: Record<string, number[]> = {
      '20s': [1.26, 1.17, 0.97, 0.88], '30s': [1.08, 1.01, 0.86, 0.79],
      '40s': [0.97, 0.91, 0.78, 0.72], '50s': [0.86, 0.81, 0.7, 0.65],
    };
    const female_t: Record<string, number[]> = {
      '20s': [0.78, 0.72, 0.59, 0.53], '30s': [0.66, 0.62, 0.53, 0.49],
      '40s': [0.61, 0.57, 0.48, 0.44], '50s': [0.54, 0.51, 0.43, 0.4],
    };
    const table = male ? male_t : female_t;
    const th = table[ageBand] ?? table['20s'];
    return this.byThresholds(ratio, th, ['Excelente', 'Bom', 'Médio', 'Regular'], 'Fraco');
  }

  /** Classificação do leg press: 1RM/peso corporal (Cooper Institute, 1997). */
  legPressRating(ratio: number, male: boolean, ageBand: string): string {
    const male_t: Record<string, number[]> = {
      '20s': [2.08, 2.0, 1.83, 1.65], '30s': [1.88, 1.8, 1.63, 1.55],
      '40s': [1.76, 1.7, 1.56, 1.5], '50s': [1.66, 1.6, 1.46, 1.4],
    };
    const female_t: Record<string, number[]> = {
      '20s': [1.63, 1.54, 1.35, 1.26], '30s': [1.42, 1.35, 1.2, 1.13],
      '40s': [1.32, 1.26, 1.12, 1.06], '50s': [1.26, 1.13, 0.99, 0.86],
    };
    const table = male ? male_t : female_t;
    const th = table[ageBand] ?? table['20s'];
    return this.byThresholds(ratio, th, ['Excelente', 'Bom', 'Médio', 'Regular'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.22 Squats Test — classificação (7 níveis) por sexo e idade
  // ---------------------------------------------------------------------
  squatsRating(reps: number, male: boolean, ageBand: string): string {
    const male_t: Record<string, number[]> = {
      '18to25': [50, 44, 39, 35, 31, 25], '26to35': [46, 40, 35, 31, 29, 22],
      '36to45': [42, 35, 30, 27, 23, 17], '46to55': [36, 29, 25, 22, 18, 13],
      '56to65': [32, 25, 21, 17, 13, 9], '65plus': [29, 22, 19, 15, 11, 7],
    };
    const female_t: Record<string, number[]> = {
      '18to25': [44, 37, 33, 29, 25, 18], '26to35': [40, 33, 29, 25, 21, 13],
      '36to45': [34, 27, 23, 19, 15, 7], '46to55': [28, 22, 18, 14, 10, 5],
      '56to65': [25, 18, 13, 10, 7, 3], '65plus': [24, 17, 14, 11, 5, 2],
    };
    const table = male ? male_t : female_t;
    const th = table[ageBand] ?? table['18to25'];
    return this.byThresholds(
      reps, th,
      ['Excelente', 'Bom', 'Acima da média', 'Média', 'Abaixo da média', 'Fraco'],
      'Muito fraco'
    );
  }

  // ---------------------------------------------------------------------
  // 5.25 Wall Squat — 16-19 anos (Arnot & Gaines, 1984)
  // ---------------------------------------------------------------------
  wallSquatRating(timeSeconds: number, male: boolean): string {
    const th = male ? [103, 76, 58, 30] : [61, 46, 36, 20];
    return this.byThresholds(timeSeconds, th, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 5.27 The Quadrathlon — fórmulas de pontos
  // ---------------------------------------------------------------------
  quadrathlonPoints(event: string, x: number): number {
    switch (event) {
      case 'slj': return -36.14048 + x * 37.268536 + x * x * -0.128057;
      case '3j': return -36.36996 + x * 12.478922 + x * x * -0.007423;
      case 'sprint30': return 209.70039 + x * -36.94427 + x * x * 0.165766;
      case 'ohshot': return -22.32216 + x * 5.8318756 + x * x * -0.000334;
      default: return 0;
    }
  }

  // ---------------------------------------------------------------------
  // 5.28 Wilf Paish Rugby Football Tests — fórmulas de pontos
  // ---------------------------------------------------------------------
  wilfPaishPoints(test: number, value: number): number {
    switch (test) {
      case 1: return (value - 2560) / 14.4; // distância Cooper 12 min (m)
      case 2: return (6.7 - value) / 0.032; // sprint 30 m (s)
      case 3: return (value - 25) / 0.65; // squat thrusts em 1 min
      case 4: return (value - 15) / 0.5; // abdominais em 1 min
      case 5: return (value - 25) / 0.75; // flexões em 1 min
      case 6: return (78 - value) / 0.48; // stamina bound 22 m (s)
      case 7: return (25.8 - value) / 0.098; // zig zag (s)
      case 8: return (16.8 - value) / 0.068; // star run (s)
      case 9: return (100 - value) / 0.4; // diagonal pitch run (s)
      default: return 0;
    }
  }

  wilfPaishRating(totalPoints: number): string {
    if (totalPoints > 800) { return 'Excelente'; }
    if (totalPoints >= 700) { return 'Muito bom'; }
    if (totalPoints >= 600) { return 'Bom'; }
    if (totalPoints >= 500) { return 'Médio'; }
    return 'Fraco';
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  private static readonly AGE_DECADES = [
    { value: '20s', label: '20 a 29 anos' },
    { value: '30s', label: '30 a 39 anos' },
    { value: '40s', label: '40 a 49 anos' },
    { value: '50s', label: '50 a 59 anos' },
  ];

  /** Metadados dos 28 testes de Força. */
  getTests(): StrengthTestConfig[] {
    const g = StrengthTestsService.GENDER_OPTIONS;
    const decades = StrengthTestsService.AGE_DECADES;
    const oneRmProtocol = (initial: string) => [
      `Selecionar a resistência inicial (${initial})`,
      'Se o atleta completar 1 repetição com sucesso, descansar 1 minuto e adicionar carga',
      'Repetir o procedimento, com 1 minuto de recuperação entre tentativas, até determinar a 1RM',
      'Registrar a resistência final',
    ];
    return [
      {
        id: 'core-strength',
        code: '5.1',
        name: 'Core Muscle Strength and Stability Test',
        objective: 'Monitorar o desenvolvimento da força de core do atleta.',
        requiredResources: ['Superfície plana', 'Colchonete', 'Relógio/cronômetro', 'Auxiliar'],
        protocol: [
          'Estágio 1: prancha com apoio de antebraços por 60 s (postura de costas, pescoço e cabeça mantida durante todo o teste)',
          'Estágio 2: elevar o braço direito por 15 s; Estágio 3: trocar para o braço esquerdo por 15 s',
          'Estágio 4: elevar a perna direita por 15 s; Estágio 5: trocar para a perna esquerda por 15 s',
          'Estágio 6: elevar perna esquerda e braço direito por 15 s; Estágio 7: trocar (perna direita e braço esquerdo) por 15 s',
          'Estágio 8: retornar à prancha básica por 30 s; Estágio 9: fim do teste',
          'Registrar o estágio em que o atleta não conseguiu manter a postura correta',
        ],
        analysisNote:
          'Completar até o estágio 8 (inclusive) indica boa força de core. Compare com avaliações anteriores.',
        fields: [
          {
            key: 'stage', label: 'Estágio alcançado', type: 'select',
            options: Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: `Estágio ${i + 1}` })),
          },
        ],
      },
      {
        id: 'curl-up',
        code: '5.2',
        name: 'Curl Up Test',
        objective: 'Avaliar a resistência dos músculos abdominais do atleta.',
        requiredResources: ['Superfície plana', 'Colchonete', 'Relógio/metrônomo', 'Auxiliar'],
        protocol: [
          'Deitar com joelhos flexionados, pés no chão, mãos nas coxas e a nuca nas mãos do parceiro',
          'Enrolar o tronco lentamente deslizando as mãos pelas coxas até os dedos tocarem as patelas e retornar',
          'Os pés não são segurados; cada repetição completa dura 3 s (20 repetições/min)',
          'Repetir o máximo possível nesse ritmo e registrar o total',
        ],
        analysisNote:
          'Compare o total com a tabela normativa por sexo e idade (McArdle et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [
              { value: 'under35', label: 'Menos de 35 anos' },
              { value: '35to44', label: '35 a 44 anos' },
              { value: 'over45', label: '45 anos ou mais' },
            ],
          },
          { key: 'reps', label: 'Repetições completadas', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'canadian-crunch',
        code: '5.3',
        name: 'Canadian Crunch Test',
        objective: 'Monitorar o desenvolvimento da força abdominal do atleta.',
        requiredResources: ['Fitas adesivas', 'Trena', 'Metrônomo', 'Auxiliar'],
        protocol: [
          'Metrônomo a 40 bpm; atleta deitado de costas com braços estendidos ao lado do corpo',
          'Colar uma fita no chão na ponta dos dedos e outra 3 polegadas adiante',
          'Em cada crunch, enrolar as costelas em direção à pelve para os dedos irem de uma fita à outra',
          'Executar o máximo de crunches no ritmo do metrônomo; o teste termina quando o ritmo não é mais mantido',
          'O auxiliar conta as repetições corretas',
        ],
        analysisNote: 'Excelente: 60 repetições (homens) e 50 repetições (mulheres).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'reps', label: 'Crunches corretos', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'sit-ups',
        code: '5.4',
        name: 'Sit Ups Test',
        objective: 'Monitorar o desenvolvimento dos músculos abdominais do atleta.',
        requiredResources: ['Superfície plana', 'Colchonete', 'Parceiro para segurar os pés'],
        protocol: [
          'Deitar com joelhos flexionados, pés no chão e braços cruzados sobre o peito',
          'Cada repetição começa com as costas no chão; subir até 90° e retornar',
          'Os pés podem ser segurados pelo parceiro',
          'Registrar o número de abdominais completados em 30 segundos',
        ],
        analysisNote:
          'Compare o total com a tabela normativa (16-19 anos, Davis et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'reps', label: 'Abdominais em 30 s', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'jumps-decathlon',
        code: '5.5',
        name: 'Jumps Decathlon',
        objective: 'Avaliar a força elástica do atleta em 10 eventos de saltos.',
        requiredResources: ['Caixa de areia (salto em distância)', 'Trena de 30 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Cada evento permite 2-3 tentativas válidas; registrar a melhor distância/tempo',
          'Eventos: salto em distância parado; salto triplo parado; 2 hops + passada + salto; 2 hops + 2 passadas + salto; 2 hops + 2 passadas + 2 saltos',
          '5 saltos com pés juntos (bunny hops); 4 hops parado + salto (média das pernas); 4 hops em corrida + salto (média das pernas)',
          '25 m em hop cronometrado (média das pernas); salto em distância com 5 passadas',
          'Todos os saltos parados iniciam de posição estática',
        ],
        analysisNote:
          'Os pontos de cada evento saem das fórmulas do livro (D = distância em m, T = tempo em s); some os 10 para o total e compare com testes anteriores.',
        fields: [
          { key: 'slj', label: 'Salto em distância parado', type: 'number', unit: 'm', step: 0.01 },
          { key: 'stj', label: 'Salto triplo parado', type: 'number', unit: 'm', step: 0.01 },
          { key: 'h2sj', label: '2 hops, passada e salto', type: 'number', unit: 'm', step: 0.01 },
          { key: 'h2s2j', label: '2 hops, 2 passadas e salto', type: 'number', unit: 'm', step: 0.01 },
          { key: 'h2s2j2', label: '2 hops, 2 passadas e 2 saltos', type: 'number', unit: 'm', step: 0.01 },
          { key: 'bunny5', label: '5 saltos com pés juntos', type: 'number', unit: 'm', step: 0.01 },
          { key: 'sh4j', label: '4 hops parado + salto (média)', type: 'number', unit: 'm', step: 0.01 },
          { key: 'rh4j', label: '4 hops em corrida + salto (média)', type: 'number', unit: 'm', step: 0.01 },
          { key: 'hop25', label: '25 m em hop (média)', type: 'number', unit: 's', step: 0.01 },
          { key: 'slj5', label: 'Salto em distância com 5 passadas', type: 'number', unit: 'm', step: 0.01 },
        ],
      },
      {
        id: 'leg-strength',
        code: '5.6',
        name: 'Leg Strength Test',
        objective: 'Monitorar a força elástica de pernas do atleta.',
        requiredResources: ['Pista de 400 m com seção de 25 m marcada', 'Cones', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Marcar 25 m na reta da pista com 2 cones; o atleta parte 10-15 m antes da linha',
          'Com corrida de aproximação leve, o atleta inicia hops na perna dominante a partir do primeiro cone',
          'Registrar o tempo entre os 2 cones e repetir com a outra perna',
        ],
        analysisNote:
          'Compare o tempo com a tabela de % rank de atletas de classe mundial (D.A. Chu, 1996).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'timeDominant', label: 'Tempo (perna dominante)', type: 'number', unit: 's', step: 0.01 },
          { key: 'timeOther', label: 'Tempo (outra perna)', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'standing-long-jump',
        code: '5.7',
        name: 'Standing Long Jump Test',
        objective: 'Monitorar a força elástica de pernas do atleta.',
        requiredResources: ['Caixa de areia', 'Trena de 30 m', 'Auxiliar'],
        protocol: [
          'Pés na borda da caixa de areia; agachar, inclinar à frente e balançar os braços para trás',
          'Saltar horizontalmente o mais longe possível, aterrissando com os dois pés na areia',
          'Medir da borda da caixa até o ponto de contato mais próximo; o salto parte de posição estática',
        ],
        analysisNote:
          'Compare a distância com as tabelas normativas (15-16 anos ou adultos).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [
              { value: 'youth', label: '15 a 16 anos' },
              { value: 'adult', label: 'Adulto' },
            ],
          },
          { key: 'distanceM', label: 'Distância', type: 'number', unit: 'm', step: 0.01 },
        ],
      },
      {
        id: 'sprint-bound-index',
        code: '5.8',
        name: 'Sprint Bound Index Test',
        objective: 'Monitorar a força elástica de pernas do atleta em 30 m de saltos alternados.',
        requiredResources: ['Pista com 30 m marcados', 'Cones', 'Cronômetro', '2 auxiliares'],
        protocol: [
          'Um pé na linha de partida e o outro 2-3 pés atrás; um auxiliar conta os bounds e o outro cronometra',
          'Percorrer os 30 m em sprint-bound; cronômetro acionado quando o pé da linha sai do chão e parado quando o tronco cruza a chegada',
          'Arredondar o tempo para o décimo de segundo acima e os bounds para o meio bound abaixo',
          'Fazer 3 tentativas com 3-5 minutos de intervalo',
        ],
        analysisNote:
          'SBI = bounds x tempo; uma redução do índice indica melhora.',
        fields: [
          { key: 'bounds', label: 'Número de bounds', type: 'number', step: 0.5 },
          { key: 'timeSeconds', label: 'Tempo dos 30 m', type: 'number', unit: 's', step: 0.1 },
        ],
      },
      {
        id: 'sergeant-jump',
        code: '5.9',
        name: 'Sergeant Jump Test',
        objective: 'Monitorar a força elástica de pernas do atleta (salto vertical).',
        requiredResources: ['Parede', 'Trena de 1 m', 'Giz', 'Auxiliar'],
        protocol: [
          'Com giz nos dedos, o atleta fica de lado para a parede e, com os pés no chão, marca o ponto mais alto que alcança (M1)',
          'De posição estática, salta o mais alto possível e marca a parede (M2)',
          'O avaliador mede a distância M1-M2; o teste pode ser repetido quantas vezes o atleta quiser',
        ],
        analysisNote:
          'Compare a distância com a tabela normativa (16-19 anos) e com as tabelas de % rank e de adultos do livro.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceCm', label: 'Distância M1-M2', type: 'number', unit: 'cm', step: 0.5 },
        ],
      },
      {
        id: 'chin-up',
        code: '5.10',
        name: 'Chin Up Test',
        objective: 'Monitorar a resistência muscular de braços e ombros do atleta.',
        requiredResources: ['Barra fixa', 'Auxiliar'],
        protocol: [
          'Pendurar na barra com as palmas voltadas para o corpo',
          'Puxar até o queixo ficar no nível da barra e descer até estender os braços',
          'Repetir o máximo possível e registrar o número de barras',
        ],
        analysisNote:
          'Compare o total com a tabela normativa (16-19 anos, Davis et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'reps', label: 'Barras completadas', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'grip-strength',
        code: '5.11',
        name: 'Grip Strength Test',
        objective: 'Monitorar a força de preensão manual do atleta.',
        requiredResources: ['Dinamômetro de preensão'],
        protocol: [
          'Usar o dinamômetro com a mão dominante',
          'Registrar a maior leitura (kg) de 3 tentativas',
        ],
        analysisNote:
          'Compare a leitura com a tabela normativa (16-19 anos, Davis et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'kg', label: 'Melhor leitura', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'mb-javelin-quadrathlon',
        code: '5.12',
        name: 'Medicine Ball Javelin Quadrathlon',
        objective: 'Monitorar a aptidão e a força do atleta com 4 arremessos de medicine ball.',
        requiredResources: ['Medicine balls de 1,5 kg, 2 kg e 3 kg', 'Trena de 30 m', 'Auxiliar'],
        protocol: [
          '4 arremessos: parado 1 (H 2 kg / M 1,5 kg), parado 2 (H 3 kg / M 2 kg), 3 passadas 1 (H 2 kg / M 1,5 kg), 3 passadas 2 (H 3 kg / M 2 kg)',
          'Arremesso parado: de frente, bola acima da cabeça com as duas mãos, pés paralelos na linha; passo de acompanhamento permitido',
          'Arremesso com 3 passadas: partir parado com os pés juntos, dar 3 passos com a bola acima da cabeça e arremessar',
          'Medir do pé da frente (na soltura) até onde a bola cai',
        ],
        analysisNote:
          'Cada arremesso vale de 1 a 25 pontos pela tabela do livro; some os 4. Recorde mundial do teste: 76 pontos; recorde do Reino Unido: 66.',
        fields: [
          { key: 'st1', label: 'Arremesso parado 1', type: 'number', unit: 'm', step: 0.25 },
          { key: 'st2', label: 'Arremesso parado 2', type: 'number', unit: 'm', step: 0.25 },
          { key: 'ts1', label: 'Arremesso 3 passadas 1', type: 'number', unit: 'm', step: 0.25 },
          { key: 'ts2', label: 'Arremesso 3 passadas 2', type: 'number', unit: 'm', step: 0.25 },
        ],
      },
      {
        id: 'press-ups',
        code: '5.13',
        name: 'Press-ups Test',
        objective: 'Avaliar a resistência da musculatura de membros superiores do atleta.',
        requiredResources: ['Superfície plana', 'Colchonete', 'Cronômetro', 'Parceiro'],
        protocol: [
          'Flexão completa: mãos na largura dos ombros, braços estendidos; descer até os cotovelos a 90° e retornar',
          'Flexão modificada (opção para atletas com menor força relativa de membros superiores): mesmo movimento com apoio dos joelhos',
          'Os pés não são segurados; o movimento é contínuo, sem pausas',
          'Completar o máximo de flexões possível e registrar o total',
        ],
        analysisNote:
          'Compare o total com a tabela por tipo de flexão, sexo e idade (Pollock et al., 1984).',
        imageUrl: 'assets/tests/strength/press-ups.jpg',
        fields: [
          {
            key: 'variant', label: 'Tipo de flexão', type: 'select',
            options: [
              { value: 'full', label: 'Completa' },
              { value: 'modified', label: 'Modificada (joelhos)' },
            ],
          },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [...decades, { value: '60plus', label: '60 anos ou mais' }],
          },
          { key: 'reps', label: 'Flexões completadas', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'bench-press',
        code: '5.14',
        name: 'Bench Press Test',
        objective: 'Avaliar a força de membros superiores do atleta.',
        requiredResources: ['Barra e anilhas', 'Banco', 'Auxiliar (spotter)'],
        protocol: [
          'Carregar a barra com carga próxima da 1RM estimada',
          'Executar o máximo de repetições até a falha, com o auxiliar contando',
          'Se passar de 12 repetições: descansar 15 minutos, aumentar a carga e repetir',
        ],
        analysisNote:
          '1RM estimada = carga / (1,0278 − 0,0278 x reps), válida até 12 reps. Score = 1RM / peso corporal, classificado pela tabela do Cooper Institute (1997).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'ageBand', label: 'Faixa etária', type: 'select', options: decades },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'weightKg', label: 'Carga levantada', type: 'number', unit: 'kg', step: 0.5 },
          { key: 'reps', label: 'Repetições (máx. 12)', type: 'number', min: 1, max: 12, step: 1 },
        ],
      },
      {
        id: 'universal-bench-press',
        code: '5.15',
        name: 'Universal Bench Press Test',
        objective: 'Monitorar a força dos extensores de cotovelo e peitorais do atleta (1RM direta).',
        requiredResources: ['Estação universal de supino'],
        protocol: [
          'Posição deitada com joelhos flexionados e pés no banco',
          ...oneRmProtocol('cerca de 50% da massa corporal para homens e 33% para mulheres'),
        ],
        analysisNote:
          'Compare a 1RM registrada com avaliações anteriores do mesmo atleta.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'finalKg', label: 'Resistência final (1RM)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'metronome-bench-press',
        code: '5.16',
        name: 'Metronome Bench Press Test',
        objective: 'Monitorar a resistência de força de membros superiores do atleta.',
        requiredResources: ['Barra e anilhas', 'Metrônomo', 'Spotter'],
        protocol: [
          'Barra com 80 lb (homens) ou 35 lb (mulheres); metrônomo a 60 bpm',
          'Deitado no banco, executar supinos no ritmo do metrônomo',
          'O spotter conta as repetições válidas (cotovelos estendidos sem travar; barra desce até o peito)',
          'O teste termina quando o atleta não mantém a forma no ritmo',
        ],
        analysisNote: 'Excelente: 37 repetições (homens) e 35 repetições (mulheres).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'reps', label: 'Repetições válidas', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'overhead-press',
        code: '5.17',
        name: 'Overhead Press Test',
        objective: 'Monitorar a força dos extensores de cotovelo e da cintura escapular (1RM direta).',
        requiredResources: ['Estação universal de desenvolvimento', 'Cinto lombar de suporte'],
        protocol: [
          'Em pé, inclinado no aparelho com a perna de trás estendida e a da frente flexionada (~150°); pegadas junto à frente dos ombros',
          'Ao elevar a carga, o corpo avança levemente para braços, tronco e perna de trás formarem uma linha reta',
          ...oneRmProtocol('cerca de 33% da massa corporal para homens e 25% para mulheres'),
          'Cinto lombar recomendado nas cargas máximas',
        ],
        analysisNote:
          'Compare a 1RM registrada com avaliações anteriores do mesmo atleta.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'finalKg', label: 'Resistência final (1RM)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'leg-press',
        code: '5.18',
        name: 'Leg Press Test',
        objective: 'Avaliar a força de membros inferiores do atleta.',
        requiredResources: ['Leg press', 'Auxiliar'],
        protocol: [
          'Selecionar carga próxima da 1RM estimada',
          'Executar o máximo de repetições até a falha, com o auxiliar contando',
          'Se passar de 12 repetições: descansar 15 minutos, aumentar a carga e repetir',
        ],
        analysisNote:
          '1RM estimada = carga / (1,0278 − 0,0278 x reps). Score = 1RM / peso corporal, classificado pela tabela do Cooper Institute (1997).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'ageBand', label: 'Faixa etária', type: 'select', options: decades },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'weightKg', label: 'Carga pressionada', type: 'number', unit: 'kg', step: 0.5 },
          { key: 'reps', label: 'Repetições (máx. 12)', type: 'number', min: 1, max: 12, step: 1 },
        ],
      },
      {
        id: 'leg-curl',
        code: '5.19',
        name: 'Leg Curl Test',
        objective: 'Avaliar a força dos flexores de joelho (isquiotibiais) do atleta (1RM direta).',
        requiredResources: ['Banco universal de flexão/extensão de joelhos'],
        protocol: [
          'Deitado de bruços com joelhos estendidos e calcanhares atrás dos apoios; segurar a frente do aparelho',
          'Inspirar na subida e expirar ao baixar; o ângulo final do joelho deve ser menor que 90°',
          ...oneRmProtocol('cerca de 30% da massa corporal para homens e 20% para mulheres'),
        ],
        analysisNote:
          'Compare a 1RM registrada com avaliações anteriores do mesmo atleta.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'finalKg', label: 'Resistência final (1RM)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'knee-extension',
        code: '5.20',
        name: 'Dynamic Knee Extension Test',
        objective: 'Avaliar a força dos extensores de joelho do atleta (1RM direta).',
        requiredResources: ['Banco universal de flexão/extensão de joelhos'],
        protocol: [
          'Sentado na borda do banco com a borda acolchoada atrás dos joelhos; pés atrás dos rolos e mãos nas laterais do banco',
          'A técnica correta é a extensão completa do joelho em movimento suave e contínuo',
          ...oneRmProtocol('cerca de 33% da massa corporal para homens e 25% para mulheres'),
        ],
        analysisNote:
          'Compare a 1RM registrada com avaliações anteriores do mesmo atleta.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'finalKg', label: 'Resistência final (1RM)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'biceps-curl',
        code: '5.21',
        name: 'Biceps Curl Test',
        objective: 'Monitorar a força dos flexores de cotovelo do atleta (1RM direta).',
        requiredResources: [
          'Halteres de 1,4 kg a pelo menos 22,7 kg (incrementos pequenos)',
          'Encosto inclinado a 30° da vertical',
          'Auxiliar',
        ],
        protocol: [
          'Conferir o encosto a 30° da vertical; carga inicial conforme a força estimada (destreinados: 6-12 kg homens, 3-6 kg mulheres)',
          'Em pé atrás da superfície inclinada, braço e antebraço supinado apoiados; o auxiliar entrega o halter',
          'Sem trancos, flexionar o cotovelo até o antebraço vertical; o avaliador recolhe o halter',
          'Se completar 1 repetição, descansar 1 minuto, adicionar carga e repetir até a 1RM',
        ],
        analysisNote:
          'Compare a 1RM registrada com avaliações anteriores do mesmo atleta.',
        fields: [
          { key: 'finalKg', label: 'Resistência final (1RM)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'squats',
        code: '5.22',
        name: 'Squats Test',
        objective: 'Monitorar a força de pernas do atleta.',
        requiredResources: ['Cadeira em que os joelhos fiquem a 90° sentado', 'Auxiliar'],
        protocol: [
          'Em pé de costas para a cadeira, pés na largura dos ombros',
          'Agachar tocando levemente a cadeira com o quadril e retornar em pé',
          'Repetir até a fadiga e registrar o total de agachamentos',
        ],
        analysisNote:
          'Compare o total com a tabela normativa por sexo e faixa etária do livro.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [
              { value: '18to25', label: '18 a 25 anos' },
              { value: '26to35', label: '26 a 35 anos' },
              { value: '36to45', label: '36 a 45 anos' },
              { value: '46to55', label: '46 a 55 anos' },
              { value: '56to65', label: '56 a 65 anos' },
              { value: '65plus', label: 'Mais de 65 anos' },
            ],
          },
          { key: 'reps', label: 'Agachamentos completados', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'handgrip-strength',
        code: '5.23',
        name: 'Handgrip Strength Test',
        objective: 'Avaliar a força de preensão do atleta com técnica de arco de 180°.',
        requiredResources: ['Dinamômetro de preensão'],
        protocol: [
          'Zerar e ajustar o dinamômetro ao tamanho da mão',
          'Em pé com calcanhares, glúteos e costas contra a parede, segurar o dinamômetro verticalmente acima da cabeça',
          'Apertar o mais forte possível enquanto desce o braço em arco de 180° na contagem de 3, com o cotovelo estendido',
          'Registrar a leitura final e repetir com a outra mão',
        ],
        analysisNote:
          'Não há tabela normativa para esta variação; compare as leituras com avaliações anteriores.',
        fields: [
          { key: 'rightKg', label: 'Leitura (mão direita)', type: 'number', unit: 'kg', step: 0.5 },
          { key: 'leftKg', label: 'Leitura (mão esquerda)', type: 'number', unit: 'kg', step: 0.5 },
        ],
      },
      {
        id: 'flexed-arm-hang',
        code: '5.24',
        name: 'Flexed Arm-Hang Test',
        objective: 'Monitorar a resistência muscular de flexores de cotovelo e extensores de ombro.',
        requiredResources: ['Barra acima da altura da cabeça', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Posição de suspensão com braços flexionados, pegada supinada, queixo acima da barra, quadris e joelhos estendidos',
          'Com o atleta em posição, o auxiliar aciona o cronômetro',
          'Manter a posição o máximo possível (limite de 30 s); parar quando o queixo cair abaixo da barra',
          'Registrar o tempo (máx. 30 s)',
        ],
        analysisNote:
          'Não há tabela normativa; compare o tempo com avaliações anteriores.',
        fields: [
          { key: 'timeSeconds', label: 'Tempo mantido', type: 'number', unit: 's', min: 0, max: 30, step: 0.1 },
        ],
      },
      {
        id: 'wall-squat',
        code: '5.25',
        name: 'Wall Squat Test',
        objective: 'Monitorar a resistência de força do quadríceps do atleta.',
        requiredResources: ['Local seco e aquecido (ginásio)', 'Parede lisa', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Com as costas na parede, deslizar até formar 90° no quadril e no joelho',
          'Quando pronto, elevar um pé 5 cm do chão; o cronômetro é acionado',
          'Manter o máximo possível; o cronômetro para quando o pé volta ao chão',
          'Descansar e repetir com a outra perna',
        ],
        analysisNote:
          'Compare o tempo com a tabela normativa (16-19 anos, Arnot & Gaines, 1984).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'timeSeconds', label: 'Tempo (melhor perna)', type: 'number', unit: 's', step: 0.5 },
        ],
      },
      {
        id: 'mccloy',
        code: '5.26',
        name: 'The McCloy Physical Fitness Test',
        objective: 'Monitorar a aptidão física geral do atleta com 5 exercícios.',
        requiredResources: ['Ginásio com colchonetes e barra fixa', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Executar em sequência, com 3 minutos de recuperação entre exercícios:',
          'Barras (pull ups) até o máximo; flexões até o máximo',
          'Squat thrusts por 1 minuto; squat jumps por 1 minuto; abdominais por 2 minutos',
          'O auxiliar registra as repetições de cada exercício',
        ],
        analysisNote:
          'PFI (índice de aptidão física) = soma das repetições dos 5 exercícios / 5; compare com testes anteriores.',
        fields: [
          { key: 'chins', label: 'Barras (máximo)', type: 'number', min: 0, step: 1 },
          { key: 'pressUps', label: 'Flexões (máximo)', type: 'number', min: 0, step: 1 },
          { key: 'squatThrusts', label: 'Squat thrusts (1 min)', type: 'number', min: 0, step: 1 },
          { key: 'squatJumps', label: 'Squat jumps (1 min)', type: 'number', min: 0, step: 1 },
          { key: 'sitUps', label: 'Abdominais (2 min)', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 'quadrathlon',
        code: '5.27',
        name: 'The Quadrathlon',
        objective: 'Testar a potência explosiva do atleta em 4 atividades (bateria da equipe britânica de lançamentos).',
        requiredResources: ['Pista com 30 m marcados', 'Peso (shot)', 'Caixa de areia', 'Trena de 30 m', 'Auxiliar'],
        protocol: [
          'Salto em distância parado: partir de posição estática da borda da caixa; medir até o contato mais próximo',
          'Três saltos: 3 bounds contínuos com os dois pés, partindo parado com pés paralelos; medir a distância total',
          'Sprint de 30 m: partir parado (ou de blocos); cronometrar do primeiro contato do pé ao tronco cruzar a linha',
          'Arremesso de peso por cima da cabeça, de costas para a área de queda; o atleta deve aterrissar com os pés e ficar em pé; peso conforme a categoria etária (IAAF)',
        ],
        analysisNote:
          'Os pontos de cada atividade saem das fórmulas do livro (D em metros, T em segundos); some os 4 e compare com testes anteriores.',
        fields: [
          { key: 'slj', label: 'Salto em distância parado', type: 'number', unit: 'm', step: 0.01 },
          { key: 'threeJumps', label: 'Três saltos', type: 'number', unit: 'm', step: 0.01 },
          { key: 'sprint30', label: 'Sprint de 30 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'ohShot', label: 'Arremesso por cima da cabeça', type: 'number', unit: 'm', step: 0.01 },
        ],
      },
      {
        id: 'wilf-paish',
        code: '5.28',
        name: 'The Wilf Paish Rugby Football Tests',
        objective: 'Monitorar a aptidão geral de um jogador de rugby com 9 testes.',
        requiredResources: ['Campo de rugby', 'Pista de 400 m', 'Trena de 30 m', 'Cones', 'Auxiliar'],
        protocol: [
          'T1: corrida de Cooper de 12 min (distância em m); T2: sprint de 30 m (melhor de 3)',
          'T3: squat thrusts em 1 min; T4: abdominais em 1 min; T5: flexões em 1 min',
          'T6: stamina bound de 22 m em shuttle (hop D, passadas gigantes, hop E, passadas gigantes, saltos com 2 pés, sprint) — tempo total',
          'T7: zig zag com bola entre cones — tempo; T8: star run trocando bolas nos pontos A e E — tempo; T9: corrida diagonal do campo — tempo',
        ],
        analysisNote:
          'Cada teste gera pontos pelas fórmulas do livro; some os 9 (forwards ganham +50 na comparação com backs). Total > 800 Excelente; 700-800 Muito bom; 600-699 Bom; 500-599 Médio; < 500 Fraco.',
        fields: [
          { key: 'cooperDistance', label: 'T1: Cooper 12 min', type: 'number', unit: 'm', step: 10 },
          { key: 'sprint30', label: 'T2: Sprint 30 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'squatThrusts', label: 'T3: Squat thrusts (1 min)', type: 'number', min: 0, step: 1 },
          { key: 'sitUps', label: 'T4: Abdominais (1 min)', type: 'number', min: 0, step: 1 },
          { key: 'pressUps', label: 'T5: Flexões (1 min)', type: 'number', min: 0, step: 1 },
          { key: 'staminaBound', label: 'T6: Stamina bound 22 m', type: 'number', unit: 's', step: 0.1 },
          { key: 'zigZag', label: 'T7: Zig zag', type: 'number', unit: 's', step: 0.1 },
          { key: 'starRun', label: 'T8: Star run', type: 'number', unit: 's', step: 0.1 },
          { key: 'diagonalRun', label: 'T9: Corrida diagonal', type: 'number', unit: 's', step: 0.1 },
          {
            key: 'position', label: 'Posição do jogador', type: 'select',
            options: [
              { value: 'back', label: 'Back (linha)' },
              { value: 'forward', label: 'Forward (+50 pontos na comparação)' },
            ],
          },
        ],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos. */
  calculate(testId: string, values: Record<string, any>): StrengthTestResult {
    const rows: StrengthTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'core-strength': {
        const stage = +values['stage'];
        rows.push({ label: 'Estágio alcançado', value: `${stage} de 9` });
        rows.push({
          label: 'Avaliação',
          value: stage >= 8 ? 'Boa força de core (completou até o estágio 8)' : 'Core a desenvolver (não completou o estágio 8)',
        });
        break;
      }
      case 'curl-up': {
        const reps = +values['reps'];
        rows.push({ label: 'Repetições', value: `${reps}` });
        rows.push({ label: 'Classificação', value: this.curlUpRating(reps, isMale(values['gender']), String(values['ageBand'])) });
        break;
      }
      case 'canadian-crunch': {
        const reps = +values['reps'];
        const target = isMale(values['gender']) ? 60 : 50;
        rows.push({ label: 'Crunches corretos', value: `${reps}` });
        rows.push({
          label: 'Avaliação',
          value: reps >= target ? `Excelente (padrão: ${target})` : `Abaixo do padrão "excelente" (${target})`,
        });
        break;
      }
      case 'sit-ups': {
        const reps = +values['reps'];
        rows.push({ label: 'Abdominais em 30 s', value: `${reps}` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.sitUpsRating(reps, isMale(values['gender'])) });
        break;
      }
      case 'jumps-decathlon': {
        const events = ['slj', 'stj', 'h2sj', 'h2s2j', 'h2s2j2', 'bunny5', 'sh4j', 'rh4j', 'hop25', 'slj5'];
        let total = 0;
        for (const ev of events) {
          const pts = Math.max(0, this.jumpsDecathlonPoints(ev, +values[ev]));
          total += pts;
        }
        rows.push({ label: 'Total de pontos (10 eventos)', value: this.fmt(total) });
        rows.push({ label: 'Observação', value: 'Compare o total e os pontos por evento com testes anteriores para localizar pontos fracos.' });
        break;
      }
      case 'leg-strength': {
        const male = isMale(values['gender']);
        const td = +values['timeDominant'];
        const to = +values['timeOther'];
        rows.push({ label: 'Perna dominante', value: `${this.fmt(td)} s (% rank ${this.legStrengthRank(td, male)})` });
        rows.push({ label: 'Outra perna', value: `${this.fmt(to)} s (% rank ${this.legStrengthRank(to, male)})` });
        break;
      }
      case 'standing-long-jump': {
        const d = +values['distanceM'];
        const adult = values['ageBand'] === 'adult';
        rows.push({ label: 'Distância', value: `${this.fmt(d)} m` });
        rows.push({ label: 'Classificação', value: this.standingLongJumpRating(d, isMale(values['gender']), adult) });
        break;
      }
      case 'sprint-bound-index': {
        const sbi = +values['bounds'] * +values['timeSeconds'];
        rows.push({ label: 'Sprint-bound index (SBI)', value: this.fmt(sbi) });
        rows.push({ label: 'Observação', value: 'Uma redução do SBI entre testes indica melhora.' });
        break;
      }
      case 'sergeant-jump': {
        const d = +values['distanceCm'];
        rows.push({ label: 'Distância M1-M2', value: `${this.fmt(d)} cm` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.sergeantJumpRating(d, isMale(values['gender'])) });
        break;
      }
      case 'chin-up': {
        const reps = +values['reps'];
        rows.push({ label: 'Barras', value: `${reps}` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.chinUpRating(reps, isMale(values['gender'])) });
        break;
      }
      case 'grip-strength': {
        const kg = +values['kg'];
        rows.push({ label: 'Melhor leitura', value: `${this.fmt(kg)} kg` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.gripStrengthRating(kg, isMale(values['gender'])) });
        break;
      }
      case 'mb-javelin-quadrathlon': {
        const p1 = this.mbjqPoints('st1', +values['st1']);
        const p2 = this.mbjqPoints('st2', +values['st2']);
        const p3 = this.mbjqPoints('ts1', +values['ts1']);
        const p4 = this.mbjqPoints('ts2', +values['ts2']);
        const total = p1 + p2 + p3 + p4;
        rows.push({ label: 'Arremesso parado 1', value: `${p1} ponto(s)` });
        rows.push({ label: 'Arremesso parado 2', value: `${p2} ponto(s)` });
        rows.push({ label: 'Arremesso 3 passadas 1', value: `${p3} ponto(s)` });
        rows.push({ label: 'Arremesso 3 passadas 2', value: `${p4} ponto(s)` });
        rows.push({ label: 'Total', value: `${total} pontos (recorde mundial: 76; Reino Unido: 66)` });
        break;
      }
      case 'press-ups': {
        const reps = +values['reps'];
        const full = values['variant'] === 'full';
        rows.push({ label: full ? 'Flexões completas' : 'Flexões modificadas', value: `${reps}` });
        rows.push({ label: 'Classificação', value: this.pressUpsRating(reps, full, String(values['ageBand'])) });
        break;
      }
      case 'bench-press':
      case 'leg-press': {
        const male = isMale(values['gender']);
        const oneRm = this.oneRepMax(+values['weightKg'], +values['reps']);
        const ratio = oneRm / +values['bodyWeightKg'];
        const rating = testId === 'bench-press'
          ? this.benchPressRating(ratio, male, String(values['ageBand']))
          : this.legPressRating(ratio, male, String(values['ageBand']));
        rows.push({ label: '1RM estimada', value: `${this.fmt(oneRm)} kg` });
        rows.push({ label: 'Score (1RM / peso corporal)', value: this.fmt(ratio) });
        rows.push({ label: 'Classificação', value: rating });
        break;
      }
      case 'universal-bench-press':
      case 'overhead-press':
      case 'leg-curl':
      case 'knee-extension': {
        const male = isMale(values['gender']);
        const bw = +values['bodyWeightKg'];
        const pctByTest: Record<string, [number, number]> = {
          'universal-bench-press': [0.5, 0.33],
          'overhead-press': [0.33, 0.25],
          'leg-curl': [0.3, 0.2],
          'knee-extension': [0.33, 0.25],
        };
        const [mPct, fPct] = pctByTest[testId];
        const initial = bw * (male ? mPct : fPct);
        rows.push({ label: '1RM registrada', value: `${this.fmt(+values['finalKg'])} kg` });
        rows.push({ label: 'Carga inicial de referência', value: `${this.fmt(initial)} kg` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa; comparar com testes anteriores.' });
        break;
      }
      case 'biceps-curl': {
        rows.push({ label: '1RM registrada', value: `${this.fmt(+values['finalKg'])} kg` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa; comparar com testes anteriores.' });
        break;
      }
      case 'metronome-bench-press': {
        const reps = +values['reps'];
        const target = isMale(values['gender']) ? 37 : 35;
        rows.push({ label: 'Repetições', value: `${reps}` });
        rows.push({
          label: 'Avaliação',
          value: reps >= target ? `Excelente (padrão: ${target})` : `Abaixo do padrão "excelente" (${target})`,
        });
        break;
      }
      case 'squats': {
        const reps = +values['reps'];
        rows.push({ label: 'Agachamentos', value: `${reps}` });
        rows.push({ label: 'Classificação', value: this.squatsRating(reps, isMale(values['gender']), String(values['ageBand'])) });
        break;
      }
      case 'handgrip-strength': {
        rows.push({ label: 'Mão direita', value: `${this.fmt(+values['rightKg'])} kg` });
        rows.push({ label: 'Mão esquerda', value: `${this.fmt(+values['leftKg'])} kg` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa; comparar com testes anteriores.' });
        break;
      }
      case 'flexed-arm-hang': {
        const t = Math.min(30, +values['timeSeconds']);
        rows.push({ label: 'Tempo mantido', value: `${this.fmt(t)} s (máx. 30 s)` });
        break;
      }
      case 'wall-squat': {
        const t = +values['timeSeconds'];
        rows.push({ label: 'Tempo', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.wallSquatRating(t, isMale(values['gender'])) });
        break;
      }
      case 'mccloy': {
        const sum = +values['chins'] + +values['pressUps'] + +values['squatThrusts'] + +values['squatJumps'] + +values['sitUps'];
        rows.push({ label: 'Soma das repetições', value: `${sum}` });
        rows.push({ label: 'PFI (índice de aptidão física)', value: this.fmt(sum / 5) });
        break;
      }
      case 'quadrathlon': {
        const p1 = Math.max(0, this.quadrathlonPoints('slj', +values['slj']));
        const p2 = Math.max(0, this.quadrathlonPoints('3j', +values['threeJumps']));
        const p3 = Math.max(0, this.quadrathlonPoints('sprint30', +values['sprint30']));
        const p4 = Math.max(0, this.quadrathlonPoints('ohshot', +values['ohShot']));
        rows.push({ label: 'Salto em distância parado', value: `${this.fmt(p1)} pontos` });
        rows.push({ label: 'Três saltos', value: `${this.fmt(p2)} pontos` });
        rows.push({ label: 'Sprint 30 m', value: `${this.fmt(p3)} pontos` });
        rows.push({ label: 'Arremesso por cima da cabeça', value: `${this.fmt(p4)} pontos` });
        rows.push({ label: 'Total', value: `${this.fmt(p1 + p2 + p3 + p4)} pontos` });
        break;
      }
      case 'wilf-paish': {
        const inputs = [
          +values['cooperDistance'], +values['sprint30'], +values['squatThrusts'],
          +values['sitUps'], +values['pressUps'], +values['staminaBound'],
          +values['zigZag'], +values['starRun'], +values['diagonalRun'],
        ];
        let total = 0;
        inputs.forEach((v, i) => { total += this.wilfPaishPoints(i + 1, v); });
        const isForward = values['position'] === 'forward';
        const adjusted = total + (isForward ? 50 : 0);
        rows.push({ label: 'Total de pontos', value: this.fmt(total) });
        if (isForward) {
          rows.push({ label: 'Total ajustado (forward +50)', value: this.fmt(adjusted) });
        }
        rows.push({ label: 'Classificação', value: this.wilfPaishRating(adjusted) });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
