import { Injectable } from '@angular/core';
import {
  MobilityTestConfig,
  MobilityTestResult,
  MobilityTestResultRow,
} from '../mobility-test.model';

/**
 * Serviço com os cálculos dos 11 testes de Mobilidade e Equilíbrio
 * (Capítulo 3) do livro "101 Performance Evaluation Tests"
 * (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Convenções:
 * - Distâncias em cm ou polegadas conforme a tabela normativa original do teste
 * - Tempos em segundos
 */
@Injectable({
  providedIn: 'root',
})
export class MobilityTestsService {
  // ---------------------------------------------------------------------
  // 3.1 / 3.2 Sit & Reach (modificado e padrão)
  // ---------------------------------------------------------------------
  /** Classificação (16-19 anos) — Davis et al., 2000. Distância em cm. */
  sitAndReachRating(distanceCm: number, male: boolean): string {
    const d = distanceCm;
    if (male) {
      if (d > 14) { return 'Excelente'; }
      if (d >= 11) { return 'Acima da média'; }
      if (d >= 7) { return 'Média'; }
      if (d >= 4) { return 'Abaixo da média'; }
      return 'Fraco';
    }
    if (d > 15) { return 'Excelente'; }
    if (d >= 12) { return 'Acima da média'; }
    if (d >= 7) { return 'Média'; }
    if (d >= 4) { return 'Abaixo da média'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.4 Static Flexibility Test – Ankle (polegadas)
  // ---------------------------------------------------------------------
  /** Classificação — adaptada de Johnson & Nelson, 1986. */
  ankleFlexibilityRating(distanceInches: number, male: boolean): string {
    const d = distanceInches;
    if (male) {
      if (d > 35.0) { return 'Excelente'; }
      if (d >= 32.51) { return 'Bom'; }
      if (d >= 29.51) { return 'Médio'; }
      if (d >= 26.5) { return 'Regular'; }
      return 'Fraco';
    }
    if (d > 32.0) { return 'Excelente'; }
    if (d >= 30.51) { return 'Bom'; }
    if (d >= 26.51) { return 'Médio'; }
    if (d >= 24.25) { return 'Regular'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.5 Static Flexibility Test – Hip and Trunk (polegadas)
  // ---------------------------------------------------------------------
  /** Classificação por sexo e faixa etária — Johnson & Nelson, 1986. */
  hipTrunkFlexibilityRating(distanceInches: number, male: boolean, under36: boolean): string {
    const d = distanceInches;
    if (under36) {
      if (male) {
        if (d > 17.9) { return 'Excelente'; }
        if (d >= 17.0) { return 'Bom'; }
        if (d >= 15.8) { return 'Médio'; }
        if (d >= 15.0) { return 'Regular'; }
        return 'Fraco';
      }
      if (d > 17.9) { return 'Excelente'; }
      if (d >= 16.7) { return 'Bom'; }
      if (d >= 16.2) { return 'Médio'; }
      if (d >= 15.8) { return 'Regular'; }
      return 'Fraco';
    }
    if (male) {
      if (d > 16.1) { return 'Excelente'; }
      if (d >= 14.6) { return 'Bom'; }
      if (d >= 13.9) { return 'Médio'; }
      if (d >= 13.4) { return 'Regular'; }
      return 'Fraco';
    }
    if (d > 17.4) { return 'Excelente'; }
    if (d >= 16.2) { return 'Bom'; }
    if (d >= 15.2) { return 'Médio'; }
    if (d >= 14.5) { return 'Regular'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.6 Static Flexibility Test – Shoulder (polegadas, menor = melhor)
  // ---------------------------------------------------------------------
  /** Score = distância entre polegares − largura dos ombros. */
  shoulderFlexibilityScore(thumbDistance: number, shoulderWidth: number): number {
    return thumbDistance - shoulderWidth;
  }

  /** Classificação — Johnson & Nelson, 1986 (menor score = melhor). */
  shoulderFlexibilityRating(score: number, male: boolean): string {
    if (male) {
      if (score < 7.0) { return 'Excelente'; }
      if (score <= 11.5) { return 'Bom'; }
      if (score <= 14.5) { return 'Médio'; }
      if (score <= 19.75) { return 'Regular'; }
      return 'Fraco';
    }
    if (score < 5.0) { return 'Excelente'; }
    if (score <= 9.5) { return 'Bom'; }
    if (score <= 13.0) { return 'Médio'; }
    if (score <= 17.75) { return 'Regular'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.7 Static Flexibility Test – Shoulder & Wrist (polegadas)
  // ---------------------------------------------------------------------
  /** Score = comprimento do braço − melhor elevação do bastão. */
  shoulderWristScore(armLength: number, bestRaise: number): number {
    return armLength - bestRaise;
  }

  /** Classificação — Johnson & Nelson, 1986. */
  shoulderWristRating(score: number, male: boolean): string {
    if (male) {
      if (score > 12.5) { return 'Excelente'; }
      if (score >= 11.5) { return 'Bom'; }
      if (score >= 8.25) { return 'Médio'; }
      if (score >= 6.0) { return 'Regular'; }
      return 'Fraco';
    }
    if (score > 11.75) { return 'Excelente'; }
    if (score >= 10.75) { return 'Bom'; }
    if (score >= 7.5) { return 'Médio'; }
    if (score >= 5.5) { return 'Regular'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.8 Static Flexibility Test – Trunk and Neck (polegadas)
  // ---------------------------------------------------------------------
  /** Classificação — Johnson & Nelson, 1986. */
  trunkNeckRating(distanceInches: number, male: boolean): string {
    const d = distanceInches;
    if (male) {
      if (d > 10.0) { return 'Excelente'; }
      if (d >= 8.0) { return 'Bom'; }
      if (d >= 6.0) { return 'Médio'; }
      if (d >= 3.0) { return 'Regular'; }
      return 'Fraco';
    }
    if (d > 9.75) { return 'Excelente'; }
    if (d >= 7.75) { return 'Bom'; }
    if (d >= 5.75) { return 'Médio'; }
    if (d >= 2.0) { return 'Regular'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.10 Standing Stork Test (segundos)
  // ---------------------------------------------------------------------
  /** Classificação (16-19 anos) — Arnot & Gaines, 1984. */
  storkRating(timeSeconds: number, male: boolean): string {
    const t = timeSeconds;
    if (male) {
      if (t > 50) { return 'Excelente'; }
      if (t >= 41) { return 'Acima da média'; }
      if (t >= 31) { return 'Média'; }
      if (t >= 20) { return 'Abaixo da média'; }
      return 'Fraco';
    }
    if (t > 30) { return 'Excelente'; }
    if (t >= 23) { return 'Acima da média'; }
    if (t >= 16) { return 'Média'; }
    if (t >= 10) { return 'Abaixo da média'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 3.11 Standing Stork Test – Blind (segundos → pontos)
  // ---------------------------------------------------------------------
  /** Pontuação por tempo — Arnot & Gaines, 1984. */
  storkBlindPoints(timeSeconds: number, male: boolean): number {
    // pares [tempo mínimo (s), pontos], do maior para o menor
    const male_table: [number, number][] = [
      [60, 20], [55, 18], [50, 16], [45, 14], [40, 12], [35, 10],
      [30, 8], [25, 6], [20, 4], [15, 3], [10, 2], [5, 1],
    ];
    const female_table: [number, number][] = [
      [30, 20], [25, 17], [20, 14], [15, 11], [10, 8], [5, 4],
    ];
    const table = male ? male_table : female_table;
    for (const [minTime, points] of table) {
      if (timeSeconds >= minTime) { return points; }
    }
    return 0;
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  private static readonly YES_NO_OPTIONS = [
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' },
  ];

  /** Metadados dos 11 testes de Mobilidade e Equilíbrio. */
  getTests(): MobilityTestConfig[] {
    const g = MobilityTestsService.GENDER_OPTIONS;
    return [
      {
        id: 'modified-sit-reach',
        code: '3.1',
        name: 'Modified Sit & Reach Test',
        objective: 'Monitorar a flexibilidade de quadril e tronco do atleta.',
        requiredResources: ['Banco de sit & reach', 'Régua', 'Auxiliar'],
        protocol: [
          'Sentar no chão com costas e cabeça contra a parede, pernas estendidas e solas dos pés contra a caixa',
          'Sobrepor as mãos e esticar os braços à frente mantendo cabeça e costas na parede; medir a distância das pontas dos dedos até a borda da caixa — este é o ponto zero',
          'Flexionar lentamente à frente deslizando os dedos pela régua o máximo possível',
          'Manter a posição final por 2 segundos e registrar a distância alcançada',
          'Repetir 3 vezes e anotar a melhor distância',
        ],
        analysisNote:
          'Compare a melhor distância com avaliações anteriores e com a tabela normativa (16-19 anos, Davis et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceCm', label: 'Melhor distância', type: 'number', unit: 'cm', step: 0.1 },
        ],
      },
      {
        id: 'sit-reach',
        code: '3.2',
        name: 'Sit and Reach Test',
        objective: 'Monitorar a flexibilidade de lombar e isquiotibiais do atleta.',
        requiredResources: ['Banco de sit & reach (ou banco com régua)', 'Auxiliar'],
        protocol: [
          'Sentar no chão descalço, pés apoiados na caixa e pernas estendidas',
          'Alcançar à frente empurrando os dedos pela mesa o máximo possível',
          'A distância das pontas dos dedos até a borda é o escore; como a caixa tem 15 cm de projeção, quem passa 10 cm dos pés marca 25 cm',
          'Fazer algumas tentativas de aquecimento e registrar o melhor escore',
        ],
        analysisNote:
          'Compare o melhor escore com avaliações anteriores e com a tabela normativa (16-19 anos, Davis et al., 2000).',
        imageUrl: 'assets/tests/mobility/sit-reach.jpg',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceCm', label: 'Melhor escore', type: 'number', unit: 'cm', step: 0.1 },
        ],
      },
      {
        id: 'hip-flexion',
        code: '3.3',
        name: 'Hip Flexion Test',
        objective: 'Monitorar a flexibilidade dos flexores de quadril do atleta.',
        requiredResources: ['Superfície plana'],
        protocol: [
          'O atleta deita de costas',
          'Levanta o joelho esquerdo e, com as mãos, puxa-o em direção ao peito',
          'A flexibilidade é normal se a perna direita permanecer estendida no chão; os flexores estão encurtados se a perna direita levantar do chão',
          'Repetir com a outra perna',
        ],
        analysisNote:
          'Teste qualitativo, sem tabela normativa; compare com avaliações anteriores do mesmo atleta.',
        fields: [
          {
            key: 'rightStays', label: 'Perna direita permaneceu no chão (puxando o joelho esquerdo)?',
            type: 'select', options: MobilityTestsService.YES_NO_OPTIONS,
          },
          {
            key: 'leftStays', label: 'Perna esquerda permaneceu no chão (puxando o joelho direito)?',
            type: 'select', options: MobilityTestsService.YES_NO_OPTIONS,
          },
        ],
      },
      {
        id: 'ankle-flexibility',
        code: '3.4',
        name: 'Static Flexibility Test – Ankle',
        objective: 'Monitorar a flexibilidade de tornozelo do atleta.',
        requiredResources: ['Parede', 'Régua de 1 metro', 'Auxiliar'],
        protocol: [
          'Ficar de frente para a parede com os pés no chão e os dedos tocando a parede, inclinando-se contra ela',
          'Deslizar os pés para trás o máximo possível, mantendo os pés totalmente apoiados, corpo e joelhos estendidos e o peito em contato com a parede',
          'Medir a distância entre a linha dos dedos dos pés e a parede (aproximação de 1/4 de polegada)',
          'Repetir 3 vezes e registrar a melhor distância',
        ],
        analysisNote:
          'Compare a melhor distância com avaliações anteriores e com a tabela normativa (Johnson & Nelson, 1986).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceInches', label: 'Melhor distância', type: 'number', unit: 'pol', step: 0.25 },
        ],
      },
      {
        id: 'hip-trunk-flexibility',
        code: '3.5',
        name: 'Static Flexibility Test – Hip and Trunk',
        objective: 'Monitorar a flexibilidade de quadril e tronco do atleta.',
        requiredResources: ['Banco de sit & reach (ou banco com régua)', 'Auxiliar'],
        protocol: [
          'Mesma posição inicial do sit & reach modificado: costas e cabeça na parede, pernas estendidas, solas dos pés na caixa; ponto zero na distância inicial dos dedos',
          'Flexionar lentamente à frente deslizando os dedos pela régua o máximo possível',
          'Manter a posição final por 2 segundos e registrar a distância (aproximação de 1/10 de polegada)',
          'Repetir 3 vezes e anotar a melhor distância',
        ],
        analysisNote:
          'Compare a melhor distância com avaliações anteriores e com a tabela normativa por faixa etária (Johnson & Nelson, 1986).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [
              { value: 'under36', label: 'Menos de 36 anos' },
              { value: '36to49', label: '36 a 49 anos' },
            ],
          },
          { key: 'distanceInches', label: 'Melhor distância', type: 'number', unit: 'pol', step: 0.1 },
        ],
      },
      {
        id: 'shoulder-flexibility',
        code: '3.6',
        name: 'Static Flexibility Test – Shoulder',
        objective: 'Monitorar a flexibilidade de ombro do atleta.',
        requiredResources: ['Corda de 1 metro', 'Trena', 'Auxiliar'],
        protocol: [
          'Segurar uma ponta da corda com a mão esquerda e, 4 polegadas adiante, segurá-la com a direita',
          'Estender os braços à frente do peito e girá-los por cima da cabeça até a corda tocar as costas, deixando a mão direita deslizar pela corda conforme houver resistência',
          'Medir a distância entre os polegares e a largura dos ombros (deltóide a deltóide), com aproximação de 1/4 de polegada',
          'Score = distância entre polegares − largura dos ombros; repetir 3 vezes e registrar o melhor',
        ],
        analysisNote:
          'Quanto menor o score, melhor a flexibilidade. Compare com a tabela normativa (Johnson & Nelson, 1986).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'thumbDistance', label: 'Distância entre polegares', type: 'number', unit: 'pol', step: 0.25 },
          { key: 'shoulderWidth', label: 'Largura dos ombros', type: 'number', unit: 'pol', step: 0.25 },
        ],
      },
      {
        id: 'shoulder-wrist-flexibility',
        code: '3.7',
        name: 'Static Flexibility Test – Shoulder & Wrist',
        objective: 'Monitorar a flexibilidade de ombro e punho do atleta.',
        requiredResources: ['Bastão de 18 polegadas', 'Régua de 1 metro', 'Auxiliar'],
        protocol: [
          'Deitar de bruços com os braços estendidos à frente segurando o bastão',
          'Elevar o bastão o mais alto possível mantendo o nariz no chão',
          'Medir a elevação vertical do bastão (aproximação de 1/2 polegada); repetir 3 vezes e registrar a melhor',
          'Medir o comprimento do braço (extremidade acromial até a ponta do dedo mais longo)',
          'Score = comprimento do braço − melhor elevação',
        ],
        analysisNote:
          'Compare o score com a tabela normativa (Johnson & Nelson, 1986).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'armLength', label: 'Comprimento do braço', type: 'number', unit: 'pol', step: 0.25 },
          { key: 'bestRaise', label: 'Melhor elevação do bastão', type: 'number', unit: 'pol', step: 0.5 },
        ],
      },
      {
        id: 'trunk-neck-flexibility',
        code: '3.8',
        name: 'Static Flexibility Test – Trunk and Neck',
        objective: 'Monitorar a flexibilidade de tronco e pescoço do atleta.',
        requiredResources: ['Régua de 1 metro', 'Auxiliar'],
        protocol: [
          'Deitar de bruços com as mãos entrelaçadas na lateral da cabeça',
          'Elevar o tronco o mais alto possível mantendo o quadril em contato com o chão (o auxiliar pode segurar os pés)',
          'Registrar a distância vertical da ponta do nariz ao chão (aproximação de 1/4 de polegada)',
          'Repetir 3 vezes e registrar a melhor distância',
        ],
        analysisNote:
          'Compare a melhor distância com a tabela normativa (Johnson & Nelson, 1986).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceInches', label: 'Melhor distância nariz-chão', type: 'number', unit: 'pol', step: 0.25 },
        ],
      },
      {
        id: 'trunk-flexion',
        code: '3.9',
        name: 'Trunk Flexion Test',
        objective: 'Monitorar a flexibilidade de lombar e isquiotibiais do atleta.',
        requiredResources: ['Régua de jarda (yardstick)', 'Auxiliar'],
        protocol: [
          'Descalço, sentar com os joelhos estendidos e os pés afastados 12 polegadas',
          'Posicionar a régua entre as pernas com a marca de 15 polegadas alinhada aos pés (o zero fica mais próximo dos joelhos)',
          'Sobrepor as mãos com as pontas dos dedos alinhadas',
          'Expirar e inclinar lentamente à frente, deslizando os dedos pela régua o máximo possível',
          'O auxiliar registra a melhor de 3 medições',
        ],
        analysisNote:
          'Excelente: mais de 20 polegadas para homens e mais de 24 polegadas para mulheres.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'distanceInches', label: 'Melhor distância', type: 'number', unit: 'pol', step: 0.25 },
        ],
      },
      {
        id: 'standing-stork',
        code: '3.10',
        name: 'Standing Stork Test',
        objective: 'Monitorar a capacidade do atleta de manter o equilíbrio em posição estática.',
        requiredResources: ['Local seco e aquecido (ginásio)', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Em pé, mãos no quadril, elevar uma perna e apoiar os dedos desse pé contra o joelho da outra perna',
          'Ao comando do auxiliar, elevar o calcanhar e ficar na ponta do pé; o cronômetro é acionado',
          'Equilibrar-se o máximo possível sem o calcanhar tocar o chão e sem o outro pé sair do joelho',
          'Registrar o tempo e repetir com a outra perna',
        ],
        analysisNote:
          'Compare o tempo com a tabela normativa (16-19 anos, Arnot & Gaines, 1984).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'timeSeconds', label: 'Tempo de equilíbrio', type: 'number', unit: 's', step: 0.1 },
        ],
      },
      {
        id: 'standing-stork-blind',
        code: '3.11',
        name: 'Standing Stork Test – Blind',
        objective: 'Monitorar o equilíbrio estático do atleta com os olhos fechados.',
        requiredResources: ['Local seco e aquecido (ginásio)', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Em pé, mãos no quadril, apoiado na perna preferida com o pé plano no chão; os dedos do outro pé contra o joelho da perna de apoio',
          'Ao comando do auxiliar, fechar os olhos; o cronômetro é acionado',
          'O cronômetro para quando o atleta abre os olhos, move as mãos, tira o pé do joelho ou move o pé de apoio',
          'Repetir 3 vezes e usar o melhor tempo',
        ],
        analysisNote:
          'A pontuação é atribuída pela tabela de tempo x pontos (Arnot & Gaines, 1984).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'timeSeconds', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.1 },
        ],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos (ver AgilityTestsService.calculate). */
  calculate(testId: string, values: Record<string, any>): MobilityTestResult {
    const rows: MobilityTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'modified-sit-reach':
      case 'sit-reach': {
        const d = +values['distanceCm'];
        rows.push({ label: 'Distância', value: `${this.fmt(d)} cm` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.sitAndReachRating(d, isMale(values['gender'])) });
        break;
      }
      case 'hip-flexion': {
        const right = values['rightStays'] === 'yes';
        const left = values['leftStays'] === 'yes';
        rows.push({ label: 'Flexores do lado direito', value: right ? 'Flexibilidade normal' : 'Encurtados' });
        rows.push({ label: 'Flexores do lado esquerdo', value: left ? 'Flexibilidade normal' : 'Encurtados' });
        break;
      }
      case 'ankle-flexibility': {
        const d = +values['distanceInches'];
        rows.push({ label: 'Distância', value: `${this.fmt(d)} pol` });
        rows.push({ label: 'Classificação', value: this.ankleFlexibilityRating(d, isMale(values['gender'])) });
        break;
      }
      case 'hip-trunk-flexibility': {
        const d = +values['distanceInches'];
        const under36 = values['ageBand'] === 'under36';
        rows.push({ label: 'Distância', value: `${this.fmt(d)} pol` });
        rows.push({ label: 'Classificação', value: this.hipTrunkFlexibilityRating(d, isMale(values['gender']), under36) });
        break;
      }
      case 'shoulder-flexibility': {
        const score = this.shoulderFlexibilityScore(+values['thumbDistance'], +values['shoulderWidth']);
        rows.push({ label: 'Score (polegares − ombros)', value: `${this.fmt(score)} pol` });
        rows.push({ label: 'Classificação', value: this.shoulderFlexibilityRating(score, isMale(values['gender'])) });
        break;
      }
      case 'shoulder-wrist-flexibility': {
        const score = this.shoulderWristScore(+values['armLength'], +values['bestRaise']);
        rows.push({ label: 'Score (braço − elevação)', value: `${this.fmt(score)} pol` });
        rows.push({ label: 'Classificação', value: this.shoulderWristRating(score, isMale(values['gender'])) });
        break;
      }
      case 'trunk-neck-flexibility': {
        const d = +values['distanceInches'];
        rows.push({ label: 'Distância nariz-chão', value: `${this.fmt(d)} pol` });
        rows.push({ label: 'Classificação', value: this.trunkNeckRating(d, isMale(values['gender'])) });
        break;
      }
      case 'trunk-flexion': {
        const d = +values['distanceInches'];
        const male = isMale(values['gender']);
        const threshold = male ? 20 : 24;
        rows.push({ label: 'Distância', value: `${this.fmt(d)} pol` });
        rows.push({
          label: 'Avaliação',
          value: d > threshold ? 'Excelente' : `Abaixo do padrão "excelente" (> ${threshold} pol)`,
        });
        break;
      }
      case 'standing-stork': {
        const t = +values['timeSeconds'];
        rows.push({ label: 'Tempo de equilíbrio', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.storkRating(t, isMale(values['gender'])) });
        break;
      }
      case 'standing-stork-blind': {
        const t = +values['timeSeconds'];
        const points = this.storkBlindPoints(t, isMale(values['gender']));
        rows.push({ label: 'Melhor tempo', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Pontos', value: `${points}` });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
