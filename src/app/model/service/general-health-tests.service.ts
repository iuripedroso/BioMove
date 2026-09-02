import { Injectable } from '@angular/core';
import {
  GeneralHealthTestConfig,
  GeneralHealthTestResult,
  GeneralHealthTestResultRow,
} from '../general-health-test.model';

/**
 * Serviço com os cálculos dos 3 testes de Saúde Geral (Capítulo 8)
 * do livro "101 Performance Evaluation Tests"
 * (Brian Mackenzie, Electric Word plc, 2005).
 */
@Injectable({
  providedIn: 'root',
})
export class GeneralHealthTestsService {
  // ---------------------------------------------------------------------
  // 8.1 Orthostatic Heart Rate Test
  // ---------------------------------------------------------------------
  /** Diferença entre FC em pé (R2) e FC deitado (R1). */
  orthostaticDifference(restingHr: number, standingHr: number): number {
    return standingHr - restingHr;
  }

  /** Leitura da diferença ortostática segundo o livro. */
  orthostaticReading(difference: number): string {
    if (difference > 15) {
      return 'Diferença acima de 15-20 bpm: provável recuperação incompleta do treino anterior ou estresse — considere ajustar o programa para permitir recuperação completa';
    }
    return 'Diferença dentro do esperado';
  }

  // ---------------------------------------------------------------------
  // 8.3 Waist to Hip Ratio
  // ---------------------------------------------------------------------
  /** Razão cintura/quadril. */
  waistHipRatio(waist: number, hip: number): number {
    return waist / hip;
  }

  /** Leitura de risco de doença arterial coronariana (DAC). */
  waistHipReading(ratio: number, male: boolean): string {
    const limit = male ? 1.0 : 0.85;
    return ratio > limit
      ? `Acima de ${limit.toFixed(2)}: risco elevado de DAC`
      : `Até ${limit.toFixed(2)}: dentro da referência`;
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  /** Metadados dos 3 testes de Saúde Geral. */
  getTests(): GeneralHealthTestConfig[] {
    const g = GeneralHealthTestsService.GENDER_OPTIONS;
    return [
      {
        id: 'orthostatic',
        code: '8.1',
        name: 'Orthostatic Heart Rate Test',
        objective: 'Monitorar o estado de recuperação e estresse do atleta pela resposta da FC à mudança de postura.',
        requiredResources: ['Cronômetro', 'Saber aferir a própria pulsação'],
        protocol: [
          'Deitar e repousar por pelo menos 15 minutos',
          'Registrar a pulsação em repouso (R1, bpm)',
          'Levantar-se e, 15 segundos depois, registrar a pulsação novamente (R2, bpm)',
          'Registrar a diferença entre R2 e R1',
        ],
        analysisNote:
          'Diferença acima de 15-20 bpm sugere recuperação incompleta ou estresse; compare com dias anteriores para acompanhar a tendência.',
        fields: [
          { key: 'restingHr', label: 'FC em repouso (R1)', type: 'number', unit: 'bpm', step: 1 },
          { key: 'standingHr', label: 'FC em pé após 15 s (R2)', type: 'number', unit: 'bpm', step: 1 },
        ],
      },
      {
        id: 'urine-colour',
        code: '8.2',
        name: 'Urine Colour Measurement',
        objective: 'Monitorar o nível de hidratação do atleta.',
        requiredResources: [
          'Frascos para amostra', 'Cartela de cores de referência (1 a 8)',
          'Pranchetas e fichas de registro', 'Luvas', 'Balde com gelo (armazenamento)',
        ],
        protocol: [
          'Descartar o início do jato e coletar uma pequena amostra em frasco transparente (geralmente a primeira urina da manhã; amostras pré/pós-treino também podem interessar)',
          'Analisar na hora ou armazenar refrigerado para análise posterior',
          'Comparar a cor da amostra com a cartela, contra fundo branco e boa iluminação',
        ],
        analysisNote:
          'Notas 1 a 3 indicam boa hidratação (Armstrong, 2000). Medicamentos e vitaminas podem alterar a cor e invalidar o teste; telas e impressões distorcem as cores — use a cartela original para comparações precisas.',
        fields: [
          {
            key: 'colour', label: 'Nota de cor da amostra', type: 'select',
            options: Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `${i + 1}` })),
          },
        ],
      },
      {
        id: 'waist-hip',
        code: '8.3',
        name: 'Waist to Hip Ratio Evaluation Test',
        objective: 'Avaliar o risco de doença arterial coronariana (DAC) pela distribuição de gordura abdominal.',
        requiredResources: ['Trena'],
        protocol: [
          'Medir a circunferência da cintura e do quadril (mesma unidade)',
          'Dividir a medida da cintura pela do quadril',
        ],
        analysisNote:
          'Risco elevado de DAC: razão acima de 1,0 (homens) ou 0,85 (mulheres). Compare com avaliações anteriores.',
        imageUrl: 'assets/tests/general-health/waist-hip.jpg',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'waist', label: 'Circunferência da cintura', type: 'number', unit: 'cm ou pol', step: 0.5 },
          { key: 'hip', label: 'Circunferência do quadril', type: 'number', unit: 'cm ou pol', step: 0.5 },
        ],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos. */
  calculate(testId: string, values: Record<string, any>): GeneralHealthTestResult {
    const rows: GeneralHealthTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'orthostatic': {
        const diff = this.orthostaticDifference(+values['restingHr'], +values['standingHr']);
        rows.push({ label: 'Diferença (R2 − R1)', value: `${diff} bpm` });
        rows.push({ label: 'Leitura', value: this.orthostaticReading(diff) });
        break;
      }
      case 'urine-colour': {
        const colour = +values['colour'];
        rows.push({ label: 'Nota de cor', value: `${colour} de 8` });
        rows.push({
          label: 'Leitura',
          value: colour <= 3
            ? 'Boa hidratação (notas 1-3, Armstrong 2000)'
            : 'Hidratação insuficiente: ajuste a ingestão de líquidos',
        });
        break;
      }
      case 'waist-hip': {
        const male = isMale(values['gender']);
        const ratio = this.waistHipRatio(+values['waist'], +values['hip']);
        rows.push({ label: 'Razão cintura/quadril', value: this.fmt(ratio) });
        rows.push({ label: 'Leitura', value: this.waistHipReading(ratio, male) });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
