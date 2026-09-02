import { Injectable } from '@angular/core';
import {
  BodyCompositionTestConfig,
  BodyCompositionTestResult,
  BodyCompositionTestResultRow,
} from '../body-composition-test.model';

/**
 * Serviço com os cálculos dos 4 testes de Composição Corporal
 * (Capítulo 4) do livro "101 Performance Evaluation Tests"
 * (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Notas de implementação:
 * - 4.2: o livro usa a tabela de Durnin & Womersley (4 dobras); aqui usamos
 *   as equações originais de densidade corporal de Durnin & Womersley (1974)
 *   + conversão de Siri, que geram os valores da tabela.
 * - 4.3: o livro usa o nomograma de Jackson & Pollock; aqui usamos as
 *   equações originais de Jackson & Pollock (3 dobras) + conversão de Siri.
 */
@Injectable({
  providedIn: 'root',
})
export class BodyCompositionTestsService {
  // ---------------------------------------------------------------------
  // 4.1 Body Mass Index
  // ---------------------------------------------------------------------
  /** IMC = peso (kg) / altura² (m²). */
  bmi(weightKg: number, heightMeters: number): number {
    return weightKg / (heightMeters * heightMeters);
  }

  /** Classificação do IMC segundo a tabela do livro. */
  bmiRating(bmi: number): string {
    if (bmi < 20) { return 'Abaixo da faixa normal'; }
    if (bmi <= 25) { return 'Normal'; }
    if (bmi <= 30) { return 'Pré-obesidade'; }
    if (bmi <= 35) { return 'Obesidade'; }
    return 'Obesidade grave';
  }

  // ---------------------------------------------------------------------
  // 4.2 Body Fat Percentage (4 dobras: tríceps, subescapular, bíceps, suprailíaca)
  // ---------------------------------------------------------------------
  /**
   * Densidade corporal por Durnin & Womersley (1974): D = c − m·log10(soma).
   * Coeficientes por sexo e faixa etária.
   */
  private durninWomersleyDensity(sumMm: number, male: boolean, age: number): number {
    let c: number;
    let m: number;
    if (male) {
      if (age < 17) { c = 1.1533; m = 0.0643; }
      else if (age <= 19) { c = 1.162; m = 0.063; }
      else if (age <= 29) { c = 1.1631; m = 0.0632; }
      else if (age <= 39) { c = 1.1422; m = 0.0544; }
      else if (age <= 49) { c = 1.162; m = 0.07; }
      else { c = 1.1715; m = 0.0779; }
    } else {
      if (age < 17) { c = 1.1369; m = 0.0598; }
      else if (age <= 19) { c = 1.1549; m = 0.0678; }
      else if (age <= 29) { c = 1.1599; m = 0.0717; }
      else if (age <= 39) { c = 1.1423; m = 0.0632; }
      else if (age <= 49) { c = 1.1333; m = 0.0612; }
      else { c = 1.1339; m = 0.0645; }
    }
    return c - m * Math.log10(sumMm);
  }

  /** %G pela equação de Siri: 495/D − 450. */
  private siri(density: number): number {
    return 495 / density - 450;
  }

  /** %G estimado a partir da soma das 4 dobras (mm), sexo e idade. */
  bodyFat4Sites(sumMm: number, male: boolean, age: number): number {
    return this.siri(this.durninWomersleyDensity(sumMm, male, age));
  }

  // ---------------------------------------------------------------------
  // 4.3 Jackson and Pollock Skinfold Test (3 dobras)
  // ---------------------------------------------------------------------
  /**
   * Densidade por Jackson & Pollock:
   * Homens (peitoral + abdômen + coxa) — Jackson & Pollock, 1978.
   * Mulheres (tríceps + suprailíaca + coxa) — Jackson, Pollock & Ward, 1980.
   */
  jacksonPollockBodyFat(sumMm: number, male: boolean, age: number): number {
    const s = sumMm;
    const density = male
      ? 1.10938 - 0.0008267 * s + 0.0000016 * s * s - 0.0002574 * age
      : 1.0994921 - 0.0009929 * s + 0.0000023 * s * s - 0.0001392 * age;
    return this.siri(density);
  }

  // ---------------------------------------------------------------------
  // 4.4 Yuhasz Skinfold Test (6 dobras)
  // ---------------------------------------------------------------------
  /** %G pelas fórmulas de Yuhasz do livro (SFV = soma das 6 dobras, mm). */
  yuhaszBodyFat(sumMm: number, male: boolean, age30plus: boolean): number {
    if (male) {
      return age30plus ? sumMm * 0.1066 + 4.975 : sumMm * 0.097 + 3.64;
    }
    return age30plus ? sumMm * 0.224 - 2.8 : sumMm * 0.217 - 4.47;
  }

  /** Contextualização do %G segundo as referências do livro. */
  bodyFatContext(percent: number, male: boolean): string {
    const eliteMin = male ? 6 : 12;
    const eliteMax = male ? 12 : 20;
    const avgMin = male ? 15 : 18;
    const avgMax = male ? 17 : 22;
    if (percent <= eliteMax && percent >= eliteMin) {
      return `Na faixa típica de atletas de elite (${eliteMin}-${eliteMax}%)`;
    }
    if (percent < eliteMin) {
      return `Abaixo da faixa típica de atletas de elite (${eliteMin}-${eliteMax}%)`;
    }
    if (percent <= avgMax) {
      return `Na faixa média da população (${avgMin}-${avgMax}%)`;
    }
    return `Acima da faixa média da população (${avgMin}-${avgMax}%)`;
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  /** Metadados dos 4 testes de Composição Corporal. */
  getTests(): BodyCompositionTestConfig[] {
    const g = BodyCompositionTestsService.GENDER_OPTIONS;
    return [
      {
        id: 'bmi',
        code: '4.1',
        name: 'Body Mass Index',
        objective: 'Monitorar o peso do atleta em relação à altura.',
        requiredResources: ['Trena (altura)', 'Balança (peso)', 'Auxiliar'],
        protocol: [
          'Medir a altura do atleta em metros',
          'Medir o peso do atleta em quilogramas',
          'IMC = peso / (altura x altura)',
        ],
        analysisNote:
          'Faixa aceitável: 20,1 a 25,0 (homens) e 18,7 a 23,8 (mulheres). Atletas e fisiculturistas podem exceder a faixa normal por massa muscular extra.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'weightKg', label: 'Peso', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'heightMeters', label: 'Altura', type: 'number', unit: 'm', step: 0.01 },
        ],
      },
      {
        id: 'body-fat-percentage',
        code: '4.2',
        name: 'Body Fat Percentage',
        objective: 'Estimar o percentual de gordura corporal com 4 dobras cutâneas.',
        requiredResources: ['Adipômetro (compasso de dobras)', 'Auxiliar'],
        protocol: [
          'Locais de medição (sempre do lado direito, em mm): tríceps (dobra vertical no meio do braço), subescapular (dobra diagonal abaixo da escápula), bíceps (dobra vertical na frente do braço) e suprailíaca (dobra diagonal acima da crista ilíaca)',
          'Pinçar a dobra entre polegar e indicador incluindo duas espessuras de pele e gordura subcutânea',
          'Aplicar o adipômetro a cerca de 1 cm dos dedos, na profundidade da dobra',
          'Repetir cada medição 3 vezes e usar a média',
          'Somar as 4 medições para obter o total em mm',
        ],
        analysisNote:
          'O %G é obtido da soma das dobras por sexo e idade (Durnin & Womersley). Média: homens 15-17%, mulheres 18-22%; atletas de elite: homens 6-12%, mulheres 12-20%.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'age', label: 'Idade', type: 'number', unit: 'anos', min: 10, max: 90, step: 1 },
          { key: 'triceps', label: 'Dobra do tríceps', type: 'number', unit: 'mm', step: 0.5 },
          { key: 'subscapular', label: 'Dobra subescapular', type: 'number', unit: 'mm', step: 0.5 },
          { key: 'biceps', label: 'Dobra do bíceps', type: 'number', unit: 'mm', step: 0.5 },
          { key: 'suprailiac', label: 'Dobra suprailíaca', type: 'number', unit: 'mm', step: 0.5 },
        ],
      },
      {
        id: 'jackson-pollock',
        code: '4.3',
        name: 'Jackson and Pollock Skinfold Test',
        objective: 'Estimar o percentual de gordura corporal com 3 dobras cutâneas.',
        requiredResources: ['Adipômetro (compasso de dobras)', 'Auxiliar'],
        protocol: [
          'Locais por sexo (lado direito, em mm): homens medem peitoral, abdômen e coxa; mulheres medem tríceps, coxa e suprailíaca',
          'Pinçar a dobra entre polegar e indicador incluindo duas espessuras de pele e gordura subcutânea',
          'Aplicar o adipômetro a cerca de 1 cm dos dedos e aliviar levemente a pressão dos dedos',
          'Repetir cada medição 3 vezes e usar a média',
          'Somar as 3 medições para obter o total em mm',
        ],
        analysisNote:
          'O %G é obtido da soma das dobras e da idade (equações de Jackson & Pollock). Média: homens 15-17%, mulheres 18-22%; atletas de elite: homens 6-12%, mulheres 12-20%.',
        imageUrl: 'assets/tests/body-composition/jackson-pollock.jpg',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'age', label: 'Idade', type: 'number', unit: 'anos', min: 10, max: 90, step: 1 },
          { key: 'fold1', label: 'Dobra 1 (peitoral / tríceps)', type: 'number', unit: 'mm', step: 0.5 },
          { key: 'fold2', label: 'Dobra 2 (abdômen / coxa)', type: 'number', unit: 'mm', step: 0.5 },
          { key: 'fold3', label: 'Dobra 3 (coxa / suprailíaca)', type: 'number', unit: 'mm', step: 0.5 },
        ],
      },
      {
        id: 'yuhasz',
        code: '4.4',
        name: 'Yuhasz Skinfold Test',
        objective: 'Estimar o percentual de gordura corporal com 6 dobras cutâneas.',
        requiredResources: ['Adipômetro (compasso de dobras)', 'Auxiliar'],
        protocol: [
          'Locais (lado direito, em mm): tríceps, subescapular, suprailíaca, abdômen, coxa anterior e, conforme o sexo, peitoral (homens) ou coxa posterior (mulheres)',
          'Pinçar a dobra entre polegar e indicador incluindo duas espessuras de pele e gordura subcutânea',
          'Aplicar o adipômetro a cerca de 1 cm dos dedos e aliviar levemente a pressão dos dedos',
          'Repetir cada medição 3 vezes e usar a média',
          'Somar as 6 medições para obter o SFV em mm',
        ],
        analysisNote:
          'O %G é obtido pelo algoritmo de Yuhasz conforme sexo e faixa etária. Média: homens 15-17%, mulheres 18-22%; atletas de elite: homens 6-12%, mulheres 12-20%.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'ageBand', label: 'Faixa etária', type: 'select',
            options: [
              { value: '16to30', label: '16 a 30 anos' },
              { value: '30plus', label: 'Mais de 30 anos' },
            ],
          },
          { key: 'sumMm', label: 'Soma das 6 dobras (SFV)', type: 'number', unit: 'mm', step: 0.5 },
        ],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos. */
  calculate(testId: string, values: Record<string, any>): BodyCompositionTestResult {
    const rows: BodyCompositionTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'bmi': {
        const male = isMale(values['gender']);
        const bmi = this.bmi(+values['weightKg'], +values['heightMeters']);
        rows.push({ label: 'IMC', value: this.fmt(bmi) });
        rows.push({ label: 'Classificação', value: this.bmiRating(bmi) });
        rows.push({
          label: 'Faixa aceitável',
          value: male ? '20,1 a 25,0 (homens)' : '18,7 a 23,8 (mulheres)',
        });
        break;
      }
      case 'body-fat-percentage': {
        const male = isMale(values['gender']);
        const sum = +values['triceps'] + +values['subscapular'] + +values['biceps'] + +values['suprailiac'];
        const pct = this.bodyFat4Sites(sum, male, +values['age']);
        rows.push({ label: 'Soma das 4 dobras', value: `${this.fmt(sum)} mm` });
        rows.push({ label: '%G estimado', value: `${this.fmt(pct)} %` });
        rows.push({ label: 'Contexto', value: this.bodyFatContext(pct, male) });
        break;
      }
      case 'jackson-pollock': {
        const male = isMale(values['gender']);
        const sum = +values['fold1'] + +values['fold2'] + +values['fold3'];
        const pct = this.jacksonPollockBodyFat(sum, male, +values['age']);
        rows.push({ label: 'Soma das 3 dobras', value: `${this.fmt(sum)} mm` });
        rows.push({ label: '%G estimado', value: `${this.fmt(pct)} %` });
        rows.push({ label: 'Contexto', value: this.bodyFatContext(pct, male) });
        break;
      }
      case 'yuhasz': {
        const male = isMale(values['gender']);
        const pct = this.yuhaszBodyFat(+values['sumMm'], male, values['ageBand'] === '30plus');
        rows.push({ label: '%G estimado', value: `${this.fmt(pct)} %` });
        rows.push({ label: 'Contexto', value: this.bodyFatContext(pct, male) });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
