import { Injectable } from '@angular/core';
import {
  EnduranceTestConfig,
  EnduranceTestResult,
  EnduranceTestResultRow,
} from '../endurance-test.model';

/**
 * Serviço com os cálculos dos 24 testes de Endurance (Capítulo 1) do livro
 * "101 Performance Evaluation Tests" (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Cada método implementa apenas a fórmula/algoritmo de análise do teste
 * (o "cálculo final"), não o protocolo de aplicação em si (que envolve
 * equipamento, cronometragem, etc. e deve ser conduzido pelo avaliador).
 *
 * Convenções:
 * - Tempos ("T"/"Time") sempre em minutos e frações de minuto
 *   (ex: 13 min 15 s = 13.25)
 * - VO2max sempre em ml/kg/min, salvo indicação contrária
 */
@Injectable({
  providedIn: 'root',
})
export class EnduranceTestsService {
  // ---------------------------------------------------------------------
  // 1.1 Astrand Treadmill Test
  // ---------------------------------------------------------------------
  /** VO2max estimado a partir do tempo total de corrida na esteira. */
  astrandTreadmillTest(timeMinutes: number): number {
    return timeMinutes * 1.444 + 14.99;
  }

  // ---------------------------------------------------------------------
  // 1.2 Balke Treadmill Test
  // ---------------------------------------------------------------------
  /** VO2max estimado (homens ativos/sedentários) – Pollock et al., 1976. */
  balkeTreadmillTestMale(timeMinutes: number): number {
    return timeMinutes * 1.444 + 14.99;
  }

  /** VO2max estimado (mulheres ativas/sedentárias) – Pollock et al., 1982. */
  balkeTreadmillTestFemale(timeMinutes: number): number {
    return timeMinutes * 1.38 + 5.22;
  }

  // ---------------------------------------------------------------------
  // 1.3 Balke VO2max Test (corrida de 15 minutos em pista)
  // ---------------------------------------------------------------------
  /**
   * VO2max estimado a partir da distância (em metros) percorrida em
   * 15 minutos de corrida (fórmula de Frank Horwill).
   */
  balkeVo2maxTest(totalDistanceMeters: number): number {
    return ((totalDistanceMeters / 15 - 133) * 0.172) + 33.3;
  }

  // ---------------------------------------------------------------------
  // 1.4 Bruce Treadmill Test
  // ---------------------------------------------------------------------
  /** VO2max estimado (homens ativos/sedentários) – Foster et al., 1984. */
  bruceTreadmillTestMale(timeMinutes: number): number {
    const t = timeMinutes;
    return 14.8 - 1.379 * t + 0.451 * t ** 2 - 0.012 * t ** 3;
  }

  /** VO2max estimado (mulheres ativas/sedentárias) – Pollock et al., 1982. */
  bruceTreadmillTestFemale(timeMinutes: number): number {
    return 4.38 * timeMinutes - 3.9;
  }

  // ---------------------------------------------------------------------
  // 1.5 The 2.4 kilometre Run Test
  // ---------------------------------------------------------------------
  /**
   * Não existe fórmula publicada para converter o tempo em VO2max;
   * o teste é avaliado por comparação com testes anteriores do mesmo
   * atleta. Este helper só calcula o ritmo médio (min/km).
   */
  run24kmPaceMinutesPerKm(timeMinutes: number): number {
    return timeMinutes / 2.4;
  }

  // ---------------------------------------------------------------------
  // 1.6 Conconi Test
  // ---------------------------------------------------------------------
  /**
   * Ponto de deflexão (limiar anaeróbico), obtido visualmente no gráfico
   * velocidade x FC. Aqui só é feita uma detecção simples: a velocidade em
   * que o ganho de FC por incremento de velocidade cai bruscamente
   * (heurística; a leitura do gráfico original é subjetiva).
   */
  conconiAnaerobicThreshold(speeds: number[], heartRates: number[]): number {
    if (speeds.length !== heartRates.length || speeds.length < 3) {
      throw new Error('Séries de velocidade e FC precisam ter o mesmo tamanho (mínimo 3 pontos).');
    }
    let maxDropIndex = 1;
    let maxSlopeDrop = -Infinity;
    for (let i = 1; i < heartRates.length - 1; i++) {
      const slopeBefore = (heartRates[i] - heartRates[i - 1]) / (speeds[i] - speeds[i - 1]);
      const slopeAfter = (heartRates[i + 1] - heartRates[i]) / (speeds[i + 1] - speeds[i]);
      const drop = slopeBefore - slopeAfter;
      if (drop > maxSlopeDrop) {
        maxSlopeDrop = drop;
        maxDropIndex = i;
      }
    }
    return heartRates[maxDropIndex];
  }

  /** Estimativa do limiar aeróbico: limiar anaeróbico menos 20 bpm. */
  conconiAerobicThreshold(anaerobicThresholdBpm: number): number {
    return anaerobicThresholdBpm - 20;
  }

  // ---------------------------------------------------------------------
  // 1.7 Cooper VO2max Test
  // ---------------------------------------------------------------------
  /** VO2max estimado a partir da distância (m) percorrida em 12 minutos. */
  cooperVo2maxTest(distanceMeters: number): number {
    return (distanceMeters - 504.9) / 44.73;
  }

  // ---------------------------------------------------------------------
  // 1.8 Critical Swim Speed (CSS)
  // ---------------------------------------------------------------------
  /** Velocidade crítica de nado (m/s) a partir dos tempos de 50 m e 400 m. */
  criticalSwimSpeed(time50mSeconds: number, time400mSeconds: number): number {
    const d1 = 50;
    const d2 = 400;
    return (d2 - d1) / (time400mSeconds - time50mSeconds);
  }

  /** Tempo alvo (s) para uma repetição de determinada distância, dado o CSS. */
  criticalSwimSpeedTargetTime(distanceMeters: number, cssMetersPerSecond: number): number {
    return distanceMeters / cssMetersPerSecond;
  }

  // ---------------------------------------------------------------------
  // 1.9 Harvard Step Test
  // ---------------------------------------------------------------------
  /**
   * Índice de aptidão a partir de 3 medições de FC (1, 2 e 3 minutos
   * após o término do teste).
   */
  harvardStepTest(pulse1: number, pulse2: number, pulse3: number): number {
    return 3000 / (pulse1 + pulse2 + pulse3);
  }

  // ---------------------------------------------------------------------
  // 1.10 Astrand Cycle Test
  // ---------------------------------------------------------------------
  /**
   * O resultado é lido em tabelas publicadas (FC estável x carga), não há
   * fórmula fechada. Este helper apenas sugere a carga inicial (kpm/min)
   * conforme sexo, idade e nível de atividade, como ponto de partida do
   * protocolo.
   */
  astrandCycleTestInitialWorkload(
    gender: 'male' | 'female',
    age: number,
    active: boolean
  ): { minKpm: number; maxKpm: number } {
    if (gender === 'female') {
      if (!active && age >= 40) return { minKpm: 150, maxKpm: 150 };
      if (!active && age < 40) return { minKpm: 150, maxKpm: 300 };
      if (active && age < 40) return { minKpm: 300, maxKpm: 450 };
      return { minKpm: 450, maxKpm: 600 };
    }
    if (!active && age < 40) return { minKpm: 150, maxKpm: 300 };
    if (!active && age >= 40) return { minKpm: 300, maxKpm: 600 };
    if (active && age < 40) return { minKpm: 600, maxKpm: 600 };
    return { minKpm: 600, maxKpm: 900 };
  }

  // ---------------------------------------------------------------------
  // 1.11 Home Step Test
  // ---------------------------------------------------------------------
  /** FC de recuperação estimada (bpm) a partir da contagem de 15 segundos. */
  homeStepTestScore(beatsIn15Seconds: number): number {
    return beatsIn15Seconds * 4;
  }

  // ---------------------------------------------------------------------
  // 1.12 Three Minute Step Test
  // ---------------------------------------------------------------------
  /**
   * O próprio valor da FC de recuperação (60 s, medida 5 s após o término)
   * já é o escore do atleta — não há fórmula adicional.
   */
  threeMinuteStepTestScore(recoveryHeartRate60s: number): number {
    return recoveryHeartRate60s;
  }

  // ---------------------------------------------------------------------
  // 1.13 Multi-Stage Fitness Test (Beep Test / MSFT)
  // ---------------------------------------------------------------------
  /** Número de shuttles (tiros de 20 m) acumulados ao final de cada nível. */
  private static readonly MSFT_SHUTTLES_PER_LEVEL: Record<number, number> = {
    1: 8, 2: 16, 3: 24, 4: 33, 5: 42, 6: 52, 7: 62, 8: 73, 9: 84, 10: 95,
    11: 107, 12: 119, 13: 132, 14: 145, 15: 158, 16: 172, 17: 186, 18: 201,
    19: 216, 20: 232, 21: 248, 22: 264,
  };

  /**
   * Total de shuttles (TS) completados, dado o nível atingido e o número
   * de tiros completados dentro desse nível.
   */
  msftTotalShuttles(level: number, shuttlesInLevel: number): number {
    const previousLevel = level - 1;
    const base = previousLevel >= 1 ? EnduranceTestsService.MSFT_SHUTTLES_PER_LEVEL[previousLevel] : 0;
    return base + shuttlesInLevel;
  }

  /** VO2max estimado a partir do total de shuttles (TS) completados (±0.3 ml/kg/min). */
  msftVo2max(totalShuttles: number): number {
    const ts = totalShuttles;
    return 18.043461 + 0.3689295 * ts - 0.000349 * ts * ts;
  }

  // ---------------------------------------------------------------------
  // 1.14 Queen's College Step Test
  // ---------------------------------------------------------------------
  /** VO2max estimado (homens) a partir da FC de recuperação (15 s pós-teste). */
  queensCollegeStepTestMale(pulseRate15s: number): number {
    return 111.33 - 1.68 * pulseRate15s;
  }

  /** VO2max estimado (mulheres) a partir da FC de recuperação (15 s pós-teste). */
  queensCollegeStepTestFemale(pulseRate15s: number): number {
    return 65.81 - 0.7388 * pulseRate15s;
  }

  // ---------------------------------------------------------------------
  // 1.15 Rockport Fitness Walking Test
  // ---------------------------------------------------------------------
  /**
   * VO2max estimado a partir de peso, idade, sexo, tempo (1 milha) e FC
   * final.
   * @param weightLbs peso em libras (lb)
   * @param gender 1 = masculino, 0 = feminino
   * @param timeMinutes tempo da milha em minutos e centésimos
   */
  rockportFitnessWalkingTest(
    weightLbs: number,
    age: number,
    gender: 0 | 1,
    timeMinutes: number,
    heartRate: number
  ): number {
    return (
      132.853 -
      0.0769 * weightLbs -
      0.3877 * age +
      6.315 * gender -
      3.2649 * timeMinutes -
      0.1565 * heartRate
    );
  }

  // ---------------------------------------------------------------------
  // 1.16 Tecumseh Step Test
  // ---------------------------------------------------------------------
  /**
   * O escore é o próprio número de batimentos contados em 30 segundos,
   * classificado depois em tabelas normativas por idade/sexo (ver
   * `tecumsehClassification`).
   */
  tecumsehStepTestScore(beatsIn30Seconds: number): number {
    return beatsIn30Seconds;
  }

  // ---------------------------------------------------------------------
  // 1.17 Treadmill VO2max Test
  // ---------------------------------------------------------------------
  /** VO2max estimado a partir do tempo total de corrida (min). */
  treadmillVo2maxTest(timeMinutes: number): number {
    return 42 + timeMinutes * 2;
  }

  // ---------------------------------------------------------------------
  // 1.18 VO2max from a One Mile Jog
  // ---------------------------------------------------------------------
  /**
   * VO2max estimado (homens) a partir de peso (kg), tempo da milha (min)
   * e FC ao final.
   */
  oneMileJogVo2maxMale(weightKg: number, timeMinutes: number, heartRate: number): number {
    return 108.844 - 0.1636 * weightKg - 1.438 * timeMinutes - 0.1928 * heartRate;
  }

  /** VO2max estimado (mulheres) — mesmos parâmetros do teste masculino. */
  oneMileJogVo2maxFemale(weightKg: number, timeMinutes: number, heartRate: number): number {
    return 100.5 - 0.1636 * weightKg - 1.438 * timeMinutes - 0.1928 * heartRate;
  }

  // ---------------------------------------------------------------------
  // 1.19 VO2max from Non-exercise Data
  // ---------------------------------------------------------------------
  /**
   * VO2max estimado sem exercício, a partir de sexo, IMC, nível de
   * atividade física percebido (PAR) e capacidade funcional percebida
   * para 1 milha (PFA1) e 3 milhas (PFA3) — escalas 0-10 e 1-13
   * conforme o questionário original do livro.
   */
  vo2maxNonExerciseData(
    gender: 0 | 1,
    bmi: number,
    physicalActivityRating: number,
    perceivedFunctionalAbility1Mile: number,
    perceivedFunctionalAbility3Mile: number
  ): number {
    return (
      44.895 +
      7.042 * gender -
      0.823 * bmi +
      0.688 * physicalActivityRating +
      0.738 * perceivedFunctionalAbility1Mile +
      perceivedFunctionalAbility3Mile
    );
  }

  /** IMC auxiliar (kg/m²), usado como entrada do teste acima. */
  calculateBmi(weightKg: number, heightMeters: number): number {
    return weightKg / (heightMeters * heightMeters);
  }

  // ---------------------------------------------------------------------
  // 1.20 Running-based Anaerobic Sprint Test (RAST)
  // ---------------------------------------------------------------------
  /** Potência (W) de um tiro de 35 m: Peso x Distância² ÷ Tempo³. */
  rastSprintPower(weightKg: number, distanceMeters: number, timeSeconds: number): number {
    return (weightKg * distanceMeters ** 2) / timeSeconds ** 3;
  }

  /**
   * Resultado completo do RAST a partir dos 6 tempos de 35 m e do peso
   * do atleta: potência máxima, mínima, média e índice de fadiga.
   */
  rastResult(
    weightKg: number,
    sprintTimesSeconds: number[],
    distanceMeters = 35
  ): { maxPower: number; minPower: number; avgPower: number; fatigueIndex: number } {
    if (sprintTimesSeconds.length !== 6) {
      throw new Error('RAST exige exatamente 6 tempos de sprint.');
    }
    const powers = sprintTimesSeconds.map((t) => this.rastSprintPower(weightKg, distanceMeters, t));
    const maxPower = Math.max(...powers);
    const minPower = Math.min(...powers);
    const avgPower = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    const totalTime = sprintTimesSeconds.reduce((sum, t) => sum + t, 0);
    const fatigueIndex = (maxPower - minPower) / totalTime;
    return { maxPower, minPower, avgPower, fatigueIndex };
  }

  // ---------------------------------------------------------------------
  // 1.21 Tri-level Aerobic Test
  // ---------------------------------------------------------------------
  /** FC máxima estimada pela fórmula clássica (220 - idade). */
  estimatedMaxHeartRate(age: number): number {
    return 220 - age;
  }

  /** Índice aeróbico: carga (W) no momento em que a FC atinge 75% da FCmáx, dividida pelo peso corporal (kg). */
  triLevelAerobicIndex(workloadAtTargetHr: number, bodyWeightKg: number): number {
    return workloadAtTargetHr / bodyWeightKg;
  }

  // ---------------------------------------------------------------------
  // 1.22 / 1.23 Tri-level Lactic / Alactic Power Test
  // ---------------------------------------------------------------------
  /**
   * Ambos os testes (lático de 30 s e alático de 10 s) não têm fórmula de
   * análise — o resultado é a leitura direta do monitor do ergômetro
   * (quilojoules acumulados e potência "congelada" em watts ao final do
   * tempo). Este helper só organiza os dois valores brutos.
   */
  triLevelPowerResult(kilojoules: number, wattsAtEnd: number): { kilojoules: number; watts: number } {
    return { kilojoules, watts: wattsAtEnd };
  }

  // ---------------------------------------------------------------------
  // 1.24 Cunningham and Faulkner Test
  // ---------------------------------------------------------------------
  /**
   * Não há fórmula de conversão — o tempo até a exaustão (s), a 12.9 km/h
   * e 20% de inclinação, é comparado diretamente com testes anteriores.
   * Este helper só formata o resultado em minutos:segundos.
   */
  cunninghamFaulknerFormatTime(timeSeconds: number): string {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = (timeSeconds % 60).toFixed(1);
    return `${minutes}:${seconds.padStart(4, '0')}`;
  }

  // =======================================================================
  // Catálogo dos 24 testes + dispatcher genérico
  // =======================================================================

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  /** Metadados (nome, objetivo e campos de entrada) dos 24 testes de Endurance. */
  getTests(): EnduranceTestConfig[] {
    return [
      {
        id: 'astrand-treadmill',
        code: '1.1',
        name: 'Astrand Treadmill Test',
        objective: 'Estimar o VO2max a partir do tempo até a exaustão na esteira.',
        requiredResources: [
          'Esteira com velocidade e inclinação ajustáveis',
          'Cronômetro',
          'Auxiliar para operar o teste',
        ],
        protocol: [
          'Ajustar a esteira para 8,05 km/h com inclinação 0%',
          'O avaliado inicia a corrida/caminhada',
          'Após 3 minutos, elevar a inclinação para 2,5%',
          'A cada 2 minutos seguintes, aumentar a inclinação em mais 2,5%',
          'Cronometrar do início até o avaliado não conseguir continuar',
        ],
        analysisNote:
          'Compare o tempo total obtido com avaliações anteriores do mesmo atleta; com treinamento adequado entre elas, espera-se uma evolução progressiva.',
        fields: [{ key: 'timeMinutes', label: 'Tempo total', type: 'number', unit: 'min', step: 0.01 }],
      },
      {
        id: 'balke-treadmill',
        code: '1.2',
        name: 'Balke Treadmill Test',
        objective: 'Estimar o VO2max a partir do tempo total de caminhada na esteira.',
        requiredResources: [
          'Esteira com velocidade e inclinação ajustáveis',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Homens ativos/sedentários: velocidade fixa em 5,3 km/h; inclinação 0% no início, sobe para 2% após 1 minuto e mais 1% a cada minuto seguinte',
          'Mulheres ativas/sedentárias: velocidade fixa em 4,5 km/h; inclinação 0% no início, sobe 2,5% a cada 3 minutos',
          'Cronometrar até a exaustão — o ideal é um teste entre 9 e 15 minutos',
        ],
        analysisNote:
          'Compare o tempo total com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: EnduranceTestsService.GENDER_OPTIONS },
          { key: 'timeMinutes', label: 'Tempo total', type: 'number', unit: 'min', step: 0.01 },
        ],
      },
      {
        id: 'balke-vo2max',
        code: '1.3',
        name: 'Balke VO2max Test',
        objective: 'Estimar o VO2max a partir da distância percorrida em 15 minutos de corrida.',
        requiredResources: [
          'Pista de atletismo de 400 m',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Escolher um dia sem vento',
          'Correr o máximo de distância possível durante 15 minutos',
          'Registrar a distância total com precisão de 25 m',
        ],
        analysisNote:
          'Compare a distância percorrida com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [{ key: 'distanceMeters', label: 'Distância em 15 min', type: 'number', unit: 'm' }],
      },
      {
        id: 'bruce-treadmill',
        code: '1.4',
        name: 'Bruce Treadmill Test',
        objective: 'Estimar o VO2max a partir do tempo até a exaustão na esteira (protocolo Bruce).',
        requiredResources: [
          'Esteira com velocidade e inclinação ajustáveis',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'O avaliado corre até a exaustão em estágios de 3 minutos',
          'A cada estágio, velocidade e inclinação aumentam (de 2,74 km/h e 10% no 1º estágio até 12,07 km/h e 28% no 10º)',
          'Cronometrar até a exaustão — o ideal é um teste entre 9 e 15 minutos',
        ],
        analysisNote:
          'Compare o tempo total com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: EnduranceTestsService.GENDER_OPTIONS },
          { key: 'timeMinutes', label: 'Tempo total', type: 'number', unit: 'min', step: 0.01 },
        ],
      },
      {
        id: 'run-24km',
        code: '1.5',
        name: 'The 2.4 kilometre Run Test',
        objective: 'Avaliar a resistência aeróbica a partir do tempo para completar 2.4 km.',
        requiredResources: [
          'Pista de 400 m',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Aquecimento de 10 minutos',
          'Correr 2,4 km (6 voltas na pista) o mais rápido possível',
          'Auxiliar informa as voltas restantes',
          'Registrar o tempo total',
        ],
        analysisNote:
          'Não há fórmula publicada para VO2max neste teste; compare o tempo total com avaliações anteriores do mesmo atleta.',
        imageUrl: 'assets/tests/endurance/run-24km.jpg',
        fields: [{ key: 'timeMinutes', label: 'Tempo total', type: 'number', unit: 'min', step: 0.01 }],
      },
      {
        id: 'conconi',
        code: '1.6',
        name: 'Conconi Test',
        objective: 'Estimar o limiar anaeróbico e aeróbico a partir de pares velocidade x FC.',
        requiredResources: [
          'Monitor de frequência cardíaca',
          'Pista de 400 m ou esteira',
          'Cronômetro',
          'Auxiliar para registrar os tempos a cada 200 m',
        ],
        protocol: [
          'Aquecimento de 5 a 10 minutos',
          'Definir a velocidade inicial e o incremento a cada 200 m (distância total entre 2,5 e 4 km)',
          'Aumentar a velocidade a cada 200 m, registrando tempo e FC nesse ponto',
          'Encerrar quando não for mais possível manter o ritmo',
          'Volta à calma de 10 minutos',
        ],
        analysisNote:
          'Plote velocidade x FC num gráfico: o ponto em que a curva deixa de subir linearmente indica o limiar anaeróbico; o limiar aeróbico é estimado subtraindo 20 bpm desse valor.',
        fields: [
          { key: 'speeds', label: 'Velocidade a cada 200m', type: 'number', unit: 'km/h', repeat: 10 },
          { key: 'heartRates', label: 'FC a cada 200m', type: 'number', unit: 'bpm', repeat: 10 },
        ],
      },
      {
        id: 'cooper-vo2max',
        code: '1.7',
        name: 'Cooper VO2max Test',
        objective: 'Estimar o VO2max a partir da distância percorrida em 12 minutos.',
        requiredResources: [
          'Pista de 400 m marcada a cada 50 m',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Correr/andar o máximo de distância possível em 12 minutos',
          'Registrar a distância total percorrida',
        ],
        analysisNote:
          'Compare a distância com avaliações anteriores do mesmo atleta; o resultado também ajuda a identificar pontos fracos e acompanhar a evolução do treinamento.',
        fields: [{ key: 'distanceMeters', label: 'Distância em 12 min', type: 'number', unit: 'm' }],
      },
      {
        id: 'css',
        code: '1.8',
        name: 'Critical Swim Speed',
        objective: 'Estimar a velocidade crítica de nado (CSS) a partir dos tempos de 50m e 400m.',
        requiredResources: [
          'Piscina',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Nadar 400 m em esforço máximo, com saída do bloco ou da borda (sem mergulho)',
          'Descansar até recuperação completa',
          'Nadar 50 m em esforço máximo',
          'Registrar os dois tempos em segundos',
        ],
        analysisNote:
          'O CSS calculado pode ser usado para definir o tempo-alvo de cada repetição num treino aeróbico de séries.',
        fields: [
          { key: 'time50mSeconds', label: 'Tempo dos 50m', type: 'number', unit: 's' },
          { key: 'time400mSeconds', label: 'Tempo dos 400m', type: 'number', unit: 's' },
        ],
      },
      {
        id: 'harvard-step',
        code: '1.9',
        name: 'Harvard Step Test',
        objective: 'Calcular um índice de aptidão cardiovascular a partir de 3 medições de FC.',
        requiredResources: [
          'Banco de ginástica de 45 cm de altura',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Subir e descer o banco uma vez a cada 2 segundos, durante 5 minutos (150 subidas)',
          '1 minuto após o término, medir a FC (Pulso1)',
          '2 minutos após o término, medir a FC (Pulso2)',
          '3 minutos após o término, medir a FC (Pulso3)',
        ],
        analysisNote:
          'Compare o índice com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'pulse1', label: 'FC em 1 min pós-teste', type: 'number', unit: 'bpm' },
          { key: 'pulse2', label: 'FC em 2 min pós-teste', type: 'number', unit: 'bpm' },
          { key: 'pulse3', label: 'FC em 3 min pós-teste', type: 'number', unit: 'bpm' },
        ],
      },
      {
        id: 'astrand-cycle',
        code: '1.10',
        name: 'Astrand Cycle Test',
        objective: 'Sugerir a carga inicial (kpm/min) para o protocolo no cicloergômetro.',
        requiredResources: [
          'Cicloergômetro',
          'Monitor de frequência cardíaca',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Aquecimento de 10 minutos e ajuste do banco/guidão',
          'Auxiliar define a carga inicial conforme sexo, idade e nível de atividade',
          'Registrar a FC a cada minuto (usando os últimos 10 segundos de cada minuto)',
          'Ajustar a carga se a FC estiver fora da faixa esperada aos 2 minutos',
          'Manter a carga final por 6 minutos',
          'Encerrar se a FC ultrapassar 170 bpm (ou 85% da FC máxima estimada)',
        ],
        analysisNote:
          'Compare a carga final e a FC registrada com avaliações anteriores do mesmo atleta; a FC em estado estável pode ser consultada em tabelas publicadas para estimar o VO2max.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: EnduranceTestsService.GENDER_OPTIONS },
          { key: 'age', label: 'Idade', type: 'number', unit: 'anos' },
          {
            key: 'active',
            label: 'Nível de atividade',
            type: 'select',
            options: [
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Sedentário' },
            ],
          },
        ],
      },
      {
        id: 'home-step',
        code: '1.11',
        name: 'Home Step Test',
        objective: 'Estimar a FC de recuperação a partir da contagem de batimentos em 15s.',
        requiredResources: [
          'Banco ou degrau de 30 cm de altura',
          'Cronômetro',
          'Metrônomo (opcional)',
          'Monitor de FC (opcional)',
        ],
        protocol: [
          'Subir e descer o degrau, um pé de cada vez, por 3 minutos',
          'Manter um ritmo constante de aproximadamente 22 a 24 passos/minuto',
          'Ao término, contar os batimentos em 15 segundos',
          'Multiplicar o valor por 4',
        ],
        analysisNote:
          'Compare o valor com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [{ key: 'beatsIn15Seconds', label: 'Batimentos em 15s', type: 'number' }],
      },
      {
        id: 'three-min-step',
        code: '1.12',
        name: 'Three Minute Step Test',
        objective: 'Registrar a FC de recuperação de 60s, medida 5s após o término do teste.',
        requiredResources: [
          'Banco de 30 cm de altura',
          'Cronômetro (ou relógio com segundos)',
          'Metrônomo',
        ],
        protocol: [
          'Aquecimento',
          'Subir e descer o banco a 24 passos/minuto (metrônomo a 96) por 3 minutos',
          'Sentar imediatamente após o término',
          '5 segundos após o término, medir a FC durante 60 segundos',
        ],
        analysisNote:
          'Compare o valor com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [{ key: 'recoveryHeartRate60s', label: 'FC de recuperação (60s)', type: 'number', unit: 'bpm' }],
      },
      {
        id: 'msft',
        code: '1.13',
        name: 'Multi-Stage Fitness Test',
        objective: 'Estimar o VO2max a partir do nível e do número de tiros (shuttles) completados.',
        requiredResources: [
          'Superfície plana e antiderrapante de pelo menos 20 m',
          'Trena de 30 m',
          'Cones de marcação',
          'Áudio gravado (bipes) e reprodutor',
          'Planilha de registro',
          'Auxiliar',
        ],
        protocol: [
          'Marcar 20 m entre dois cones',
          'Aquecimento com corrida leve e alongamento',
          'Correr entre os cones seguindo o ritmo dos bipes (que aumenta a cada nível)',
          'Encostar um pé na marca a cada bipe',
          'Continuar até não conseguir mais acompanhar o ritmo (com 2-3 tiros de tolerância)',
          'Registrar o nível e o número de tiros completados nesse nível',
          'Volta à calma',
        ],
        analysisNote:
          'Compare o resultado com avaliações anteriores do mesmo atleta; a estimativa de VO2max pode variar em até ± 0,3 ml/kg/min em relação às tabelas originais do teste.',
        fields: [
          { key: 'level', label: 'Nível atingido', type: 'number', min: 1, max: 22 },
          { key: 'shuttlesInLevel', label: 'Tiros completados no nível', type: 'number', min: 0 },
        ],
      },
      {
        id: 'queens-college-step',
        code: '1.14',
        name: "Queen's College Step Test",
        objective: 'Estimar o VO2max a partir da FC de recuperação (15s pós-teste).',
        requiredResources: [
          'Banco de 41,3 cm de altura',
          'Cronômetro',
          'Metrônomo',
          'Monitor de FC (opcional)',
        ],
        protocol: [
          'Subir e descer o banco por 3 minutos: homens a 24 passos/min, mulheres a 22 passos/min',
          '5 segundos após o término, contar os batimentos durante 15 segundos (PR)',
        ],
        analysisNote:
          'Compare o valor com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: EnduranceTestsService.GENDER_OPTIONS },
          { key: 'pulseRate15s', label: 'FC em 15s pós-teste', type: 'number' },
        ],
      },
      {
        id: 'rockport',
        code: '1.15',
        name: 'Rockport Fitness Walking Test',
        objective: 'Estimar o VO2max a partir de peso, idade, sexo, tempo da milha e FC final.',
        requiredResources: [
          'Pista de 400 m',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Escolher um dia sem vento',
          'Registrar o peso corporal',
          'Caminhar 1 milha (1609 m) o mais rápido possível',
          'Registrar o tempo total',
          'Medir a FC imediatamente ao terminar',
        ],
        analysisNote:
          'Compare o VO2max estimado com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'weightLbs', label: 'Peso', type: 'number', unit: 'lb' },
          { key: 'age', label: 'Idade', type: 'number', unit: 'anos' },
          {
            key: 'gender',
            label: 'Sexo',
            type: 'select',
            options: [
              { value: 1, label: 'Masculino' },
              { value: 0, label: 'Feminino' },
            ],
          },
          { key: 'timeMinutes', label: 'Tempo da milha', type: 'number', unit: 'min', step: 0.01 },
          { key: 'heartRate', label: 'FC ao final', type: 'number', unit: 'bpm' },
        ],
      },
      {
        id: 'tecumseh',
        code: '1.16',
        name: 'Tecumseh Step Test',
        objective: 'Registrar o número de batimentos em 30s pós-teste (comparar com tabela normativa).',
        requiredResources: [
          'Banco de 20,3 cm de altura',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Realizar um ciclo de 4 passos (pé direito sobe, pé esquerdo sobe, pé direito desce, pé esquerdo desce) a 24 ciclos por minuto (metrônomo a 96)',
          'Manter por 3 minutos',
          '30 segundos após o término, contar o pulso durante 30 segundos',
        ],
        analysisNote:
          'O número de batimentos em 30 segundos é comparado a tabelas normativas por idade e sexo para classificar o condicionamento cardiorrespiratório.',
        fields: [{ key: 'beatsIn30Seconds', label: 'Batimentos em 30s', type: 'number' }],
      },
      {
        id: 'treadmill-vo2max',
        code: '1.17',
        name: 'Treadmill VO2max Test',
        objective: 'Estimar o VO2max a partir do tempo total de corrida na esteira.',
        requiredResources: [
          'Esteira com velocidade e inclinação ajustáveis',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Ajustar a esteira para 11,3 km/h com inclinação 0°',
          'A cada minuto, aumentar a inclinação conforme o protocolo, até 20° no 15º minuto',
          'Cronometrar até a exaustão',
        ],
        analysisNote:
          'Compare o tempo total com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [{ key: 'timeMinutes', label: 'Tempo total', type: 'number', unit: 'min', step: 0.01 }],
      },
      {
        id: 'one-mile-jog',
        code: '1.18',
        name: 'VO2max from a One Mile Jog',
        objective: 'Estimar o VO2max a partir de peso, tempo de 1 milha e FC final.',
        requiredResources: [
          'Pista de 400 m',
          'Cronômetro',
          'Monitor de FC',
        ],
        protocol: [
          'Aquecimento leve por alguns minutos',
          'Correr 1 milha em ritmo constante e controlado (mais de 8 min para homens / 9 min para mulheres)',
          'Registrar o tempo total',
          'Medir a FC imediatamente ao terminar',
        ],
        analysisNote:
          'Mais preciso para atletas entre 18 e 29 anos; fora dessa faixa etária ainda é útil para acompanhar a evolução do condicionamento.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: EnduranceTestsService.GENDER_OPTIONS },
          { key: 'weightKg', label: 'Peso', type: 'number', unit: 'kg' },
          { key: 'timeMinutes', label: 'Tempo da milha', type: 'number', unit: 'min', step: 0.01 },
          { key: 'heartRate', label: 'FC ao final', type: 'number', unit: 'bpm' },
        ],
      },
      {
        id: 'non-exercise-vo2max',
        code: '1.19',
        name: 'VO2max from Non-exercise Data',
        objective: 'Estimar o VO2max sem exercício, a partir de sexo, IMC e nível de atividade percebido.',
        requiredResources: [
          'Nenhum equipamento físico — apenas peso, altura e duas escalas de percepção de esforço',
        ],
        protocol: [
          'Calcular o IMC (peso ÷ altura²)',
          'Classificar o nível de atividade física dos últimos 6 meses numa escala de 0 a 10',
          'Classificar a capacidade percebida para 1 milha numa escala de 1 a 13',
          'Classificar a capacidade percebida para 3 milhas numa escala de 1 a 13',
        ],
        analysisNote:
          'Estimativa útil para triagem inicial, com margem de erro de aproximadamente ± 3,44 ml/kg/min em relação a testes de esforço direto.',
        fields: [
          {
            key: 'gender',
            label: 'Sexo',
            type: 'select',
            options: [
              { value: 1, label: 'Masculino' },
              { value: 0, label: 'Feminino' },
            ],
          },
          { key: 'weightKg', label: 'Peso', type: 'number', unit: 'kg' },
          { key: 'heightMeters', label: 'Altura', type: 'number', unit: 'm', step: 0.01 },
          { key: 'physicalActivityRating', label: 'Nível de atividade física (0-10)', type: 'number', min: 0, max: 10 },
          { key: 'pfa1', label: 'Capacidade percebida – 1 milha (1-13)', type: 'number', min: 1, max: 13 },
          { key: 'pfa3', label: 'Capacidade percebida – 3 milhas (1-13)', type: 'number', min: 1, max: 13 },
        ],
      },
      {
        id: 'rast',
        code: '1.20',
        name: 'Running-based Anaerobic Sprint Test (RAST)',
        objective: 'Calcular potência máxima, mínima, média e índice de fadiga a partir de 6 tiros de 35m.',
        requiredResources: [
          'Pista de 400 m com um trecho de 35 m demarcado',
          '2 cones',
          'Cronômetro',
          'Auxiliar',
          'Balança',
        ],
        protocol: [
          'Pesar o avaliado antes do teste',
          'Aquecimento de 10 minutos e recuperação de 5 minutos',
          'Executar 6 tiros de 35 m em esforço máximo, com 10 segundos de intervalo entre eles',
          'Registrar cada tempo com precisão de centésimos de segundo',
        ],
        analysisNote:
          'Um índice de fadiga baixo (< 10 W/s) indica boa capacidade de manter o desempenho anaeróbico; valores altos (> 10 W/s) sugerem necessidade de trabalhar a tolerância ao lactato.',
        fields: [
          { key: 'weightKg', label: 'Peso', type: 'number', unit: 'kg' },
          { key: 'sprintTime', label: 'Tempo do tiro', type: 'number', unit: 's', step: 0.01, repeat: 6 },
        ],
      },
      {
        id: 'tri-level-aerobic',
        code: '1.21',
        name: 'Tri-level Aerobic Test',
        objective: 'Calcular o índice aeróbico a partir da carga alcançada a 75% da FC máxima.',
        requiredResources: [
          'Cicloergômetro com resistência a ar (ou similar)',
          'Monitor de FC',
          'Cronômetro',
          'Balança',
        ],
        protocol: [
          'Pesar o avaliado',
          'Calcular 75% da FC máxima (220 − idade, se desconhecida)',
          'Pedalar em estágios de 1 minuto, começando em 25 W e subindo 25 W por estágio',
          'Continuar até atingir 75% da FC máxima, completando o minuto em curso',
          'Registrar a carga (W) no momento em que a FC-alvo foi atingida',
        ],
        analysisNote:
          'O índice aeróbico (carga ÷ peso corporal) é comparado entre avaliações para acompanhar a evolução da capacidade aeróbica.',
        fields: [
          { key: 'age', label: 'Idade', type: 'number', unit: 'anos' },
          { key: 'workloadAtTargetHr', label: 'Carga a 75% da FCmáx', type: 'number', unit: 'W' },
          { key: 'bodyWeightKg', label: 'Peso corporal', type: 'number', unit: 'kg' },
        ],
      },
      {
        id: 'tri-level-lactic',
        code: '1.22',
        name: 'Tri-level Lactic Power Test',
        objective: 'Registrar quilojoules e potência ao final dos 30 segundos de esforço máximo.',
        requiredResources: [
          'Cicloergômetro com monitor de trabalho integrado',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Aquecimento de 5 minutos em ritmo leve',
          'Descanso de 2 minutos',
          'Posição inicial em pé sobre os pedais',
          'Ao comando, pedalar em esforço máximo por 30 segundos',
          'Auxiliar avisa os intervalos de 10 e 20 segundos e conta os últimos 5',
          'Aos 30 segundos, registrar os quilojoules acumulados e a potência (W) congelada',
          'Volta à calma de 2 a 3 minutos',
        ],
        analysisNote:
          'Compare os valores de quilojoules e potência com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'kilojoules', label: 'Quilojoules acumulados', type: 'number', unit: 'kJ' },
          { key: 'wattsAtEnd', label: 'Potência ao final (congelada)', type: 'number', unit: 'W' },
        ],
      },
      {
        id: 'tri-level-alactic',
        code: '1.23',
        name: 'Tri-level Alactic Power Test',
        objective: 'Registrar quilojoules e potência ao final dos 10 segundos de esforço máximo.',
        requiredResources: [
          'Cicloergômetro com monitor de trabalho integrado',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Aquecimento de 5 minutos',
          'Descanso de 2 minutos',
          'Posição inicial em pé sobre os pedais',
          'Ao comando, pedalar em esforço máximo por 10 segundos, contando os últimos 5 em voz alta',
          'Aos 10 segundos, registrar os quilojoules acumulados e a potência (W) congelada',
          'Volta à calma',
        ],
        analysisNote:
          'Compare os valores de quilojoules e potência com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [
          { key: 'kilojoules', label: 'Quilojoules acumulados', type: 'number', unit: 'kJ' },
          { key: 'wattsAtEnd', label: 'Potência ao final (congelada)', type: 'number', unit: 'W' },
        ],
      },
      {
        id: 'cunningham-faulkner',
        code: '1.24',
        name: 'Cunningham and Faulkner Test',
        objective: 'Registrar o tempo até a exaustão a 12.9 km/h e 20% de inclinação.',
        requiredResources: [
          'Esteira capaz de atingir 20% de inclinação',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Aquecimento na esteira, incluindo partidas de prática no ritmo do teste',
          'Ajustar a esteira para 12,9 km/h e 20% de inclinação',
          'Cronometrar a partir do início da corrida sem apoio',
          'Continuar até a exaustão (não conseguir manter a velocidade)',
          'Registrar o tempo com precisão de 0,5 segundo',
        ],
        analysisNote:
          'Compare o tempo com avaliações anteriores do mesmo atleta; espera-se evolução progressiva com o treinamento adequado entre elas.',
        fields: [{ key: 'timeSeconds', label: 'Tempo até a exaustão', type: 'number', unit: 's', step: 0.5 }],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /**
   * Dispatcher genérico: recebe o id do teste (ver getTests()) e os valores
   * do formulário (chaves = field.key) e devolve as linhas de resultado
   * já formatadas para exibição.
   */
  calculate(testId: string, values: Record<string, any>): EnduranceTestResult {
    const rows: EnduranceTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'astrand-treadmill': {
        const vo2max = this.astrandTreadmillTest(+values['timeMinutes']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'balke-treadmill': {
        const vo2max = isMale(values['gender'])
          ? this.balkeTreadmillTestMale(+values['timeMinutes'])
          : this.balkeTreadmillTestFemale(+values['timeMinutes']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'balke-vo2max': {
        const vo2max = this.balkeVo2maxTest(+values['distanceMeters']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'bruce-treadmill': {
        const vo2max = isMale(values['gender'])
          ? this.bruceTreadmillTestMale(+values['timeMinutes'])
          : this.bruceTreadmillTestFemale(+values['timeMinutes']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'run-24km': {
        const pace = this.run24kmPaceMinutesPerKm(+values['timeMinutes']);
        rows.push({ label: 'Ritmo médio', value: `${this.fmt(pace)} min/km` });
        rows.push({ label: 'Observação', value: 'Sem fórmula publicada de VO2max; comparar com testes anteriores.' });
        break;
      }
      case 'conconi': {
        const speeds = (values['speeds'] as any[]).map(Number).filter((v) => !isNaN(v) && v > 0);
        const heartRates = (values['heartRates'] as any[]).map(Number).filter((v) => !isNaN(v) && v > 0);
        const n = Math.min(speeds.length, heartRates.length);
        if (n < 3) {
          rows.push({ label: 'Erro', value: 'Preencha ao menos 3 pares velocidade/FC.' });
          break;
        }
        const anaerobic = this.conconiAnaerobicThreshold(speeds.slice(0, n), heartRates.slice(0, n));
        const aerobic = this.conconiAerobicThreshold(anaerobic);
        rows.push({ label: 'Limiar anaeróbico (estimado)', value: `${this.fmt(anaerobic)} bpm` });
        rows.push({ label: 'Limiar aeróbico (estimado)', value: `${this.fmt(aerobic)} bpm` });
        break;
      }
      case 'cooper-vo2max': {
        const vo2max = this.cooperVo2maxTest(+values['distanceMeters']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'css': {
        const css = this.criticalSwimSpeed(+values['time50mSeconds'], +values['time400mSeconds']);
        const targetTime400 = this.criticalSwimSpeedTargetTime(400, css);
        rows.push({ label: 'Critical Swim Speed', value: `${this.fmt(css)} m/s` });
        rows.push({ label: 'Tempo alvo por 400m', value: `${this.fmt(targetTime400)} s` });
        break;
      }
      case 'harvard-step': {
        const result = this.harvardStepTest(+values['pulse1'], +values['pulse2'], +values['pulse3']);
        rows.push({ label: 'Índice de aptidão', value: this.fmt(result) });
        break;
      }
      case 'astrand-cycle': {
        const active = values['active'] === true || values['active'] === 'true';
        const { minKpm, maxKpm } = this.astrandCycleTestInitialWorkload(
          isMale(values['gender']) ? 'male' : 'female',
          +values['age'],
          active
        );
        rows.push({
          label: 'Carga inicial sugerida',
          value: minKpm === maxKpm ? `${minKpm} kpm/min` : `${minKpm} a ${maxKpm} kpm/min`,
        });
        break;
      }
      case 'home-step': {
        const score = this.homeStepTestScore(+values['beatsIn15Seconds']);
        rows.push({ label: 'FC estimada', value: `${this.fmt(score)} bpm` });
        break;
      }
      case 'three-min-step': {
        const score = this.threeMinuteStepTestScore(+values['recoveryHeartRate60s']);
        rows.push({ label: 'Escore (FC de recuperação)', value: `${this.fmt(score)} bpm` });
        break;
      }
      case 'msft': {
        const totalShuttles = this.msftTotalShuttles(+values['level'], +values['shuttlesInLevel']);
        const vo2max = this.msftVo2max(totalShuttles);
        rows.push({ label: 'Total de shuttles (TS)', value: `${totalShuttles}` });
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min (± 0.3)` });
        break;
      }
      case 'queens-college-step': {
        const vo2max = isMale(values['gender'])
          ? this.queensCollegeStepTestMale(+values['pulseRate15s'])
          : this.queensCollegeStepTestFemale(+values['pulseRate15s']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'rockport': {
        const vo2max = this.rockportFitnessWalkingTest(
          +values['weightLbs'],
          +values['age'],
          +values['gender'] as 0 | 1,
          +values['timeMinutes'],
          +values['heartRate']
        );
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'tecumseh': {
        const score = this.tecumsehStepTestScore(+values['beatsIn30Seconds']);
        rows.push({ label: 'Escore (batimentos em 30s)', value: `${score}` });
        rows.push({ label: 'Observação', value: 'Classificar na tabela normativa por idade/sexo do livro.' });
        break;
      }
      case 'treadmill-vo2max': {
        const vo2max = this.treadmillVo2maxTest(+values['timeMinutes']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'one-mile-jog': {
        const vo2max = isMale(values['gender'])
          ? this.oneMileJogVo2maxMale(+values['weightKg'], +values['timeMinutes'], +values['heartRate'])
          : this.oneMileJogVo2maxFemale(+values['weightKg'], +values['timeMinutes'], +values['heartRate']);
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min` });
        break;
      }
      case 'non-exercise-vo2max': {
        const bmi = this.calculateBmi(+values['weightKg'], +values['heightMeters']);
        const vo2max = this.vo2maxNonExerciseData(
          +values['gender'] as 0 | 1,
          bmi,
          +values['physicalActivityRating'],
          +values['pfa1'],
          +values['pfa3']
        );
        rows.push({ label: 'IMC', value: this.fmt(bmi) });
        rows.push({ label: 'VO2max estimado', value: `${this.fmt(vo2max)} ml/kg/min (± 3.44)` });
        break;
      }
      case 'rast': {
        const times = (values['sprintTime'] as any[]).map(Number);
        if (times.length !== 6 || times.some((t) => isNaN(t) || t <= 0)) {
          rows.push({ label: 'Erro', value: 'Preencha os 6 tempos de sprint.' });
          break;
        }
        const result = this.rastResult(+values['weightKg'], times);
        rows.push({ label: 'Potência máxima', value: `${this.fmt(result.maxPower)} W` });
        rows.push({ label: 'Potência mínima', value: `${this.fmt(result.minPower)} W` });
        rows.push({ label: 'Potência média', value: `${this.fmt(result.avgPower)} W` });
        rows.push({ label: 'Índice de fadiga', value: `${this.fmt(result.fatigueIndex)} W/s` });
        break;
      }
      case 'tri-level-aerobic': {
        const mhr = this.estimatedMaxHeartRate(+values['age']);
        const index = this.triLevelAerobicIndex(+values['workloadAtTargetHr'], +values['bodyWeightKg']);
        rows.push({ label: 'FC máxima estimada', value: `${this.fmt(mhr)} bpm` });
        rows.push({ label: 'Índice aeróbico', value: `${this.fmt(index)} W/kg` });
        break;
      }
      case 'tri-level-lactic':
      case 'tri-level-alactic': {
        const result = this.triLevelPowerResult(+values['kilojoules'], +values['wattsAtEnd']);
        rows.push({ label: 'Quilojoules', value: `${this.fmt(result.kilojoules)} kJ` });
        rows.push({ label: 'Potência ao final', value: `${this.fmt(result.watts)} W` });
        break;
      }
      case 'cunningham-faulkner': {
        const formatted = this.cunninghamFaulknerFormatTime(+values['timeSeconds']);
        rows.push({ label: 'Tempo até a exaustão', value: formatted });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
