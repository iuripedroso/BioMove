import { Injectable } from '@angular/core';
import {
  SpeedPowerTestConfig,
  SpeedPowerTestResult,
  SpeedPowerTestResultRow,
} from '../speed-power-test.model';

/**
 * Serviço com os cálculos dos 21 testes de Velocidade e Potência
 * (Capítulo 6) do livro "101 Performance Evaluation Tests"
 * (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Convenções: distâncias em metros, tempos em segundos, cargas em kg.
 */
@Injectable({
  providedIn: 'root',
})
export class SpeedPowerTestsService {
  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  /** Classifica por limiares crescentes de tempo (menor = melhor). */
  private byTimeThresholds(time: number, limits: number[], labels: string[], fallback: string): string {
    for (let i = 0; i < limits.length; i++) {
      if (time <= limits[i]) { return labels[i]; }
    }
    return fallback;
  }

  /** Formata segundos como m:ss para exibição de paces. */
  private pace(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ---------------------------------------------------------------------
  // 6.2 30 m Acceleration — 16-19 anos (Davis et al., 2000)
  // ---------------------------------------------------------------------
  accel30Rating(time: number, male: boolean): string {
    const limits = male ? [3.99, 4.2, 4.4, 4.6] : [4.49, 4.6, 4.8, 5.0];
    return this.byTimeThresholds(time, limits, ['Excelente', 'Acima da média', 'Média', 'Abaixo da média'], 'Fraco');
  }

  // ---------------------------------------------------------------------
  // 6.3 60 m Speed — previsões de 100 m e 200 m
  // ---------------------------------------------------------------------
  predict100From60(t60: number): number {
    return 7.3829894 + t60 * -0.431975 + t60 * t60 * 0.1394189;
  }

  predict200From60(t60: number): number {
    return 13.795573 + t60 * -0.720532 + t60 * t60 * 0.2806044;
  }

  // ---------------------------------------------------------------------
  // 6.5 / 6.6 — previsões a partir de 150 m e 250 m
  // ---------------------------------------------------------------------
  predict100From150(t150: number): number {
    return -2.496488 + t150 * 0.9996637 + t150 * t150 * -0.010305;
  }

  predict200From250(t250: number): number {
    return 14.531737 + t250 * -0.19884 + t250 * t250 * 0.0164982;
  }

  // ---------------------------------------------------------------------
  // 6.10 Margaria-Kalamen — P = M·D·9,8 / t
  // ---------------------------------------------------------------------
  margariaKalamenPower(massKg: number, verticalDistanceM: number, timeSeconds: number): number {
    return (massKg * verticalDistanceM * 9.8) / timeSeconds;
  }

  // ---------------------------------------------------------------------
  // 6.11 400 m Control Tests — índices e alvos
  // ---------------------------------------------------------------------
  speedEnduranceIndex(t150: number, t300: number): number {
    return t300 - 2 * t150;
  }

  speedEnduranceTarget(t150: number): number {
    return -11.54156 + 1.1226216 * t150 + t150 * t150 * -0.015101;
  }

  strengthEnduranceIndex(t300: number, t600: number): number {
    return t600 - 2 * t300;
  }

  strengthEnduranceTarget(t300: number): number {
    return -0.733763 + 0.2408302 * t300 + t300 * t300 * 0.0008366;
  }

  // ---------------------------------------------------------------------
  // 6.13 Sprint Fatigue — fadiga e manutenção de potência
  // ---------------------------------------------------------------------
  powerMaintenanceRating(ratio: number): string {
    if (ratio >= 0.9) { return 'Excelente'; }
    if (ratio >= 0.85) { return 'Bom'; }
    if (ratio >= 0.8) { return 'Médio'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 6.15 Flying 30 m — % rank (Chu, 1996) e previsões
  // ---------------------------------------------------------------------
  flying30Rank(time: number, male: boolean): string {
    // faixas regulares de 0,10 s: homens 2,50-3,49 s; mulheres 2,90-3,89 s
    const start = male ? 2.5 : 2.9;
    if (time < start) { return '91-100 (acima da tabela)'; }
    const idx = Math.floor((time - start) / 0.1);
    if (idx > 9) { return '1-10 (abaixo da tabela)'; }
    const low = 91 - idx * 10;
    return `${low}-${low + 9}`;
  }

  predict100FromFlying30(t: number): number {
    return 4.8793289 + t * 2.2011769 + t * t * -0.040363;
  }

  predict200FromFlying30(t: number): number {
    return 8.9693467 + t * 4.787071 + t * t * -0.107128;
  }

  // ---------------------------------------------------------------------
  // 6.16 Kosmin — previsão de 800 m / 1500 m
  // ---------------------------------------------------------------------
  kosminPrediction(totalDistance: number, event: '800' | '1500', male: boolean): number {
    let t = event === '800'
      ? 217.77778 - totalDistance * 0.119556
      : 500.52609 - totalDistance * 0.162174;
    // as equações tendem a superestimar mulheres: +5 s (800 m) e +10 s (1500 m)
    if (!male) { t += event === '800' ? 5 : 10; }
    return t;
  }

  // ---------------------------------------------------------------------
  // 6.18 PWC-170 — potência projetada a 170 bpm
  // ---------------------------------------------------------------------
  pwc170(p1: number, hr1: number, p2: number, hr2: number): number {
    return ((p1 * hr2) - (p2 * hr1)) / (hr2 - hr1) + 170 * ((p1 - p2) / (hr1 - hr2));
  }

  // ---------------------------------------------------------------------
  // 6.20 35 m Speed — adultos
  // ---------------------------------------------------------------------
  speed35Rating(time: number, male: boolean): string {
    const limits = male ? [4.79, 5.09, 5.29, 5.6] : [5.29, 5.59, 5.89, 6.2];
    return this.byTimeThresholds(time, limits, ['Excelente', 'Bom', 'Médio', 'Regular'], 'Fraco');
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  /** Metadados dos 21 testes de Velocidade e Potência. */
  getTests(): SpeedPowerTestConfig[] {
    const g = SpeedPowerTestsService.GENDER_OPTIONS;
    return [
      {
        id: 'ten-stride',
        code: '6.1',
        name: '10 Stride Test',
        objective: 'Monitorar a capacidade do atleta de acelerar de forma eficiente da largada parada.',
        requiredResources: ['Pista de 400 m com 20 m marcados na reta', 'Trena de 30 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '6 sprints de 20 m com largada parada e recuperação completa entre eles',
          'O auxiliar registra o tempo das 10 primeiras passadas (cronômetro acionado no primeiro contato do pé) e a distância coberta por elas',
        ],
        analysisNote:
          'Para cada corrida: velocidade = D/T (alvo > 7,5 m/s); passada média = D/10 (alvo > 1,5 m); passadas/s = 10/T (alvo > 4,5).',
        fields: [
          { key: 'distance', label: 'Distância das 10 passadas', type: 'number', unit: 'm', step: 0.1 },
          { key: 'time', label: 'Tempo das 10 passadas', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'accel-30m',
        code: '6.2',
        name: '30 Metre Acceleration Test',
        objective: 'Monitorar a aceleração do atleta da largada parada (ou blocos) até a velocidade máxima.',
        requiredResources: ['Pista de 400 m com 30 m marcados', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '3 corridas de 30 m com largada parada ou de blocos, com recuperação completa entre elas',
          'O auxiliar registra o tempo de cada 30 m',
        ],
        analysisNote:
          'Compare o tempo com a tabela normativa (16-19 anos, Davis et al., 2000).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'time', label: 'Melhor tempo dos 30 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'speed-60m',
        code: '6.3',
        name: '60 Metre Speed Test',
        objective: 'Monitorar a aceleração e a chegada à velocidade máxima do atleta.',
        requiredResources: ['Pista com 60 m marcados na reta', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '3 corridas de 60 m com largada parada e recuperação completa entre elas',
          'Usar os primeiros 30 m para atingir a velocidade máxima e mantê-la até os 60 m',
          'Registrar os tempos de 30 m e 60 m',
        ],
        analysisNote:
          'O tempo dos 60 m alimenta as equações de previsão dos 100 m e 200 m do livro.',
        fields: [
          { key: 'time60', label: 'Tempo dos 60 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'shuttle-run',
        code: '6.4',
        name: 'Shuttle Run Test',
        objective: 'Avaliar a capacidade do atleta de acelerar entre linhas e mudar de direção rapidamente.',
        requiredResources: ['2 linhas paralelas a 9,14 m (30 pés)', '2 blocos de madeira 5x5x10 cm', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Sprintar da linha de partida, pegar um bloco e colocá-lo no chão atrás da linha de partida',
          'Sprintar para pegar o segundo bloco e voltar cruzando a linha',
          'Cronômetro acionado no "Vai" e parado quando o peito cruza a linha',
          'Tentativa inválida se o bloco for largado (deve ser colocado) ou ficar sobre a linha',
          'Repetir 3 vezes e registrar o melhor tempo',
        ],
        analysisNote:
          'Sem tabela normativa; compare o melhor tempo com testes anteriores.',
        fields: [
          { key: 'time', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'endurance-150m',
        code: '6.5',
        name: '150 Metre Endurance Test',
        objective: 'Monitorar a resistência específica do atleta para os 100 m.',
        requiredResources: ['Pista de 400 m com 150 m marcados', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Correr 150 m com largada parada',
          'O auxiliar registra o tempo dos 150 m',
        ],
        analysisNote:
          'O tempo dos 150 m alimenta a equação de previsão dos 100 m do livro.',
        fields: [
          { key: 'time150', label: 'Tempo dos 150 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'endurance-250m',
        code: '6.6',
        name: '250 Metre Endurance Test',
        objective: 'Monitorar a resistência específica do atleta para os 200 m.',
        requiredResources: ['Pista de 400 m com 250 m marcados', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Correr 250 m com largada parada',
          'O auxiliar registra o tempo dos 250 m',
        ],
        analysisNote:
          'O tempo dos 250 m alimenta a equação de previsão dos 200 m do livro.',
        fields: [
          { key: 'time250', label: 'Tempo dos 250 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'sprint-400m',
        code: '6.7',
        name: '400 Metre Sprint Test',
        objective: 'Monitorar a potência e capacidade anaeróbica lática e a velocidade de pernas do atleta.',
        requiredResources: ['Pista de 400 m', 'Cones a cada 50 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Colocar um cone a cada 50 m da pista',
          'Largada parada com o pé da frente atrás da linha; ao "Vai", sprintar os 400 m',
          'O auxiliar registra as parciais em cada cone e o tempo final',
        ],
        analysisNote:
          'Sem tabela normativa; compare o tempo final e as parciais com testes anteriores.',
        fields: [
          { key: 'time400', label: 'Tempo final dos 400 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'shuttle-300yd',
        code: '6.8',
        name: '300 yard Shuttle Test',
        objective: 'Monitorar a potência anaeróbica intermediária (sistema lático) do atleta.',
        requiredResources: ['2 cones a 25 jardas (22,8 m)', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Partir de um cone; ao comando, realizar 12 idas e voltas entre os cones',
          'Tocar o cone em cada virada',
          'O auxiliar registra o tempo total dos 12 percursos',
        ],
        analysisNote:
          'Sem tabela normativa; compare o tempo total com testes anteriores.',
        fields: [
          { key: 'time', label: 'Tempo dos 12 percursos', type: 'number', unit: 's', step: 0.1 },
        ],
      },
      {
        id: 'dropoff-400m',
        code: '6.9',
        name: '400 Metre Drop Off Test',
        objective: 'Monitorar a eficiência anaeróbica do atleta.',
        requiredResources: ['Pista de 400 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Cronometrar 100 m em velocidade máxima',
          'Recuperar por 5 minutos',
          'Cronometrar 400 m em velocidade máxima',
          'Converter o tempo dos 400 m em parciais de 100 m (tempo / 4) e subtrair o tempo dos 100 m',
        ],
        analysisNote:
          'O objetivo é reduzir o drop off aumentando a eficiência anaeróbica; uma velocista de ponta tem drop off em torno de 0,7 s.',
        fields: [
          { key: 'time100', label: 'Tempo dos 100 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time400', label: 'Tempo dos 400 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'margaria-kalamen',
        code: '6.10',
        name: 'Margaria-Kalamen Power Test',
        objective: 'Monitorar a potência do atleta em subida de escada.',
        requiredResources: [
          'Escada de 12 degraus (~17,5 cm) com linha de partida 6 m antes do 1º degrau; 3º, 6º e 9º degraus destacados',
          'Cronômetro', 'Auxiliar',
        ],
        protocol: [
          'Registrar a massa do atleta (kg); fazer 2-3 subidas de aquecimento',
          'Ao "Vai", sprintar até a escada e subi-la de 3 em 3 degraus (3º, 6º e 9º)',
          'Cronometrar do contato no 3º degrau ao contato no 9º degrau',
          'Repetir mais 2 vezes com 2-3 minutos de recuperação; medir com precisão a distância vertical entre o 3º e o 9º degrau',
        ],
        analysisNote:
          'Potência (W) = M x D x 9,8 / t, com M em kg, D em m e t em s.',
        fields: [
          { key: 'massKg', label: 'Massa corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'verticalDistance', label: 'Distância vertical (3º ao 9º degrau)', type: 'number', unit: 'm', step: 0.01 },
          { key: 'time', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'control-400m',
        code: '6.11',
        name: '400 Metre Control Tests',
        objective: 'Monitorar velocidade, resistência de velocidade e resistência geral de um atleta de 400 m.',
        requiredResources: ['Pista de 400 m', 'Cones em 150 m, 300 m e 600 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Três corridas separadas de 150 m, 300 m e 600 m, com largada parada e recuperação completa entre elas',
          'O auxiliar registra o tempo de cada distância',
        ],
        analysisNote:
          'Índice de resistência de velocidade = t300 − 2·t150 (comparar com o alvo pela equação do livro); índice de força/resistência geral = t600 − 2·t300 (idem). Índice acima do alvo indica necessidade de mais trabalho lático (ou aeróbico, no segundo caso).',
        fields: [
          { key: 'time150', label: 'Tempo dos 150 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time300', label: 'Tempo dos 300 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time600', label: 'Tempo dos 600 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'sprint-40m',
        code: '6.12',
        name: '40 Metre Sprint Test',
        objective: 'Monitorar a aceleração e a velocidade do atleta.',
        requiredResources: ['Pista de 400 m', 'Cones', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Marcar 40 m com cones; largada parada com o pé da frente atrás da linha',
          'Ao "Vai", sprintar até a linha de chegada com o auxiliar cronometrando',
          '2 tentativas com 2-5 minutos de recuperação',
        ],
        analysisNote:
          'Sem tabela normativa; compare o melhor tempo com testes anteriores.',
        imageUrl: 'assets/tests/speed-power/sprint-40m.jpg',
        fields: [
          { key: 'time', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'sprint-fatigue',
        code: '6.13',
        name: '30 Metre Sprint Fatigue – Power Maintenance Test',
        objective: 'Medir a capacidade do atleta de repetir sprints mantendo o mesmo nível de potência.',
        requiredResources: ['Seção de 40 m de pista', '12 cones para o percurso', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Sprintar de A a B entre os cones com desvio lateral de 5 m no meio do percurso; o auxiliar cronometra',
          'Trotar de volta ao ponto A (em até 30 s) pelo trajeto marcado',
          'Ao chegar em A, repetir o sprint; completar 10 sprints no total',
        ],
        analysisNote:
          'Fadiga de sprint = tempo mais lento − mais rápido. Manutenção de potência = média dos 3 primeiros / média dos 3 últimos: >= 0,90 Excelente; 0,85-0,89 Bom; 0,80-0,84 Médio; < 0,80 Fraco.',
        fields: [
          { key: 'times', label: 'Tempo do sprint', type: 'number', unit: 's', step: 0.01, repeat: 10 },
        ],
      },
      {
        id: 'concept2-step',
        code: '6.14',
        name: 'Concept 2 Rowing Step Test',
        objective: 'Monitorar o limiar anaeróbico do atleta no remo ergômetro.',
        requiredResources: ['Remo ergômetro Concept 2', 'Monitor de FC', 'Auxiliar'],
        protocol: [
          '5 remadas de 4 minutos em pace constante de 500 m, com 30 s de recuperação entre elas; o 5º step é em esforço máximo',
          'Em cada step registrar: pace configurado, distância remada, voga (strokes/min), pace real e FC em estado estável (a FC estabiliza após ~3 min)',
          'Os paces dos steps derivam do melhor tempo de 2000 m do atleta',
        ],
        analysisNote:
          'Melhora de endurance = FC estável menor para um mesmo pace em relação a testes anteriores. Indicado para remadores com 2000 m abaixo de 8min30.',
        fields: [
          { key: 'best2000', label: 'Melhor tempo nos 2000 m', type: 'number', unit: 's', step: 1 },
        ],
      },
      {
        id: 'flying-30m',
        code: '6.15',
        name: 'Flying 30 Metre Test',
        objective: 'Monitorar a velocidade máxima do atleta.',
        requiredResources: ['Pista com 60 m marcados e cone nos 30 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '3 corridas de 60 m com largada parada e recuperação completa entre elas',
          'Usar os primeiros 30 m para atingir a velocidade máxima e mantê-la até os 60 m',
          'Registrar os tempos dos primeiros 30 m e dos 60 m completos',
          'Flying 30 m = tempo dos 60 m − tempo dos primeiros 30 m',
        ],
        analysisNote:
          'Compare o flying 30 m com a tabela de % rank (Chu, 1996); o tempo também alimenta as previsões de 100 m e 200 m do livro.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'time30', label: 'Tempo dos primeiros 30 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time60', label: 'Tempo dos 60 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'kosmin',
        code: '6.16',
        name: 'Kosmin Test',
        objective: 'Prever o tempo do atleta nos 800 m ou 1500 m a partir de corridas de 60 s.',
        requiredResources: ['Pista de 400 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '800 m: 2 esforços máximos de 60 s com 3 minutos de recuperação; cada corrida começa onde a anterior terminou; registrar a distância total',
          '1500 m: 4 esforços máximos de 60 s com recuperações decrescentes de 3, 2 e 1 minuto; registrar a distância total',
        ],
        analysisNote:
          'A previsão sai da equação do livro para a prova escolhida; para mulheres somam-se 5 s (800 m) ou 10 s (1500 m), pois as equações tendem a superestimar.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          {
            key: 'event', label: 'Prova', type: 'select',
            options: [
              { value: '800', label: '800 m (2 corridas)' },
              { value: '1500', label: '1500 m (4 corridas)' },
            ],
          },
          { key: 'totalDistance', label: 'Distância total percorrida', type: 'number', unit: 'm', step: 1 },
        ],
      },
      {
        id: 'las',
        code: '6.17',
        name: 'The LAS (Lactic vs. Speed) Test',
        objective: 'Monitorar a resistência de velocidade de um atleta de 400 m.',
        requiredResources: ['Pista de 400 m', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Contrarrelógio de 500 m; registrar o tempo (T1)',
          'Pelo menos 48 h depois: sprints de 50 m, 100 m, 150 m e 200 m com 4 minutos de recuperação entre eles',
          'S1 = soma dos tempos dos 4 sprints',
        ],
        analysisNote:
          'Compare T1 e S1: diferença acima de 5 s indica falta de endurance; abaixo de 5 s indica falta de velocidade.',
        fields: [
          { key: 'time500', label: 'Tempo dos 500 m (T1)', type: 'number', unit: 's', step: 0.1 },
          { key: 'time50', label: 'Sprint de 50 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time100', label: 'Sprint de 100 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time150', label: 'Sprint de 150 m', type: 'number', unit: 's', step: 0.01 },
          { key: 'time200', label: 'Sprint de 200 m', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'pwc170',
        code: '6.18',
        name: 'PWC-170 Cycle Test',
        objective: 'Prever a potência (watts) do atleta em uma FC projetada de 170 bpm.',
        requiredResources: ['Cicloergômetro', 'Monitor de FC', 'Cronômetro', 'Auxiliar'],
        protocol: [
          '2 sessões consecutivas de 6 minutos no cicloergômetro',
          'Cargas escolhidas para produzir FC de 120-140 bpm na 1ª sessão e 150-170 bpm na 2ª',
          'Registrar FC média (bpm) e potência (W) de cada sessão',
        ],
        analysisNote:
          'Potência a 170 bpm pela aproximação polinomial do livro: ((P1·HR2 − P2·HR1)/(HR2 − HR1)) + 170·((P1 − P2)/(HR1 − HR2)).',
        fields: [
          { key: 'p1', label: 'Potência da sessão 1', type: 'number', unit: 'W', step: 1 },
          { key: 'hr1', label: 'FC média da sessão 1', type: 'number', unit: 'bpm', step: 1 },
          { key: 'p2', label: 'Potência da sessão 2', type: 'number', unit: 'W', step: 1 },
          { key: 'hr2', label: 'FC média da sessão 2', type: 'number', unit: 'bpm', step: 1 },
        ],
      },
      {
        id: 'wingate',
        code: '6.19',
        name: 'The Wingate Anaerobic 30 Cycle Test',
        objective: 'Determinar a potência anaeróbica de pico e a capacidade anaeróbica do atleta.',
        requiredResources: ['Cicloergômetro de frenagem mecânica', 'Contador de revoluções', 'Auxiliar'],
        protocol: [
          'Após 10 minutos de aquecimento, pedalar o mais rápido possível sem resistência',
          'Em até 3 s aplica-se a resistência fixa (0,075 kg por kg de massa corporal; até 1,0-1,3 kg/kg para atletas de potência) e o atleta pedala "all out" por 30 s',
          'Registrar as revoluções do volante em intervalos de 5 s (6 contagens)',
        ],
        analysisNote:
          'PP = maior potência em 5 s; RPP = PP/massa (comparar com as tabelas de percentis de Maud & Schultz, 1989); AF = (maior − menor)/maior x 100; AC = trabalho total dos 30 s.',
        fields: [
          { key: 'massKg', label: 'Massa corporal', type: 'number', unit: 'kg', step: 0.1 },
          { key: 'distPerRev', label: 'Distância por revolução', type: 'number', unit: 'm', step: 0.1 },
          { key: 'revs', label: 'Revoluções no intervalo', type: 'number', step: 0.5, repeat: 6 },
        ],
      },
      {
        id: 'speed-35m',
        code: '6.20',
        name: '35 Metre Speed Test',
        objective: 'Avaliar a velocidade máxima de corrida do atleta em um único sprint.',
        requiredResources: ['Trena ou pista marcada', 'Cronômetro ou fotocélulas', 'Marcadores', 'Auxiliar'],
        protocol: [
          'Aquecer; marcar 35 m da linha de partida',
          'Sprintar os 35 m de largada de sprint com o auxiliar cronometrando',
          'Registrar o melhor de 3 sprints',
        ],
        analysisNote:
          'Compare o melhor tempo com a tabela de adultos do livro.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: g },
          { key: 'time', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'multiple-sprint',
        code: '6.21',
        name: 'Multiple Sprint Test',
        objective: 'Monitorar a velocidade repetida do atleta em 6 sprints de 40 m.',
        requiredResources: ['Pista com 40 m marcados', 'Cones', 'Cronômetro', 'Auxiliar'],
        protocol: [
          'Marcar 40 m em linha reta com cones',
          'Realizar 6 sprints de 40 m com 30 s de recuperação entre eles',
          'O auxiliar registra o tempo de cada sprint',
        ],
        analysisNote:
          'Tempo ótimo = 6 x melhor sprint; a diferença entre o total e o ótimo indica a fadiga — abaixo de 0,8 s é excelente para um atleta sênior.',
        fields: [
          { key: 'times', label: 'Tempo do sprint', type: 'number', unit: 's', step: 0.01, repeat: 6 },
        ],
      },
    ];
  }

  /** Formata um número com 2 casas decimais para exibição. */
  private fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  }

  /** Dispatcher genérico dos cálculos. */
  calculate(testId: string, values: Record<string, any>): SpeedPowerTestResult {
    const rows: SpeedPowerTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';
    const nums = (v: any): number[] => (Array.isArray(v) ? v.map(Number) : [Number(v)]);

    switch (testId) {
      case 'ten-stride': {
        const d = +values['distance'];
        const t = +values['time'];
        const speed = d / t;
        const stride = d / 10;
        const cadence = 10 / t;
        rows.push({ label: 'Velocidade', value: `${this.fmt(speed)} m/s (alvo > 7,5)` });
        rows.push({ label: 'Passada média', value: `${this.fmt(stride)} m (alvo > 1,5)` });
        rows.push({ label: 'Passadas por segundo', value: `${this.fmt(cadence)} (alvo > 4,5)` });
        break;
      }
      case 'accel-30m': {
        const t = +values['time'];
        rows.push({ label: 'Tempo dos 30 m', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Classificação (16-19 anos)', value: this.accel30Rating(t, isMale(values['gender'])) });
        break;
      }
      case 'speed-60m': {
        const t = +values['time60'];
        rows.push({ label: 'Tempo dos 60 m', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Previsão 100 m', value: `${this.fmt(this.predict100From60(t))} s` });
        rows.push({ label: 'Previsão 200 m', value: `${this.fmt(this.predict200From60(t))} s` });
        break;
      }
      case 'shuttle-run':
      case 'sprint-40m': {
        rows.push({ label: 'Melhor tempo', value: `${this.fmt(+values['time'])} s` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa; comparar com testes anteriores.' });
        break;
      }
      case 'endurance-150m': {
        const t = +values['time150'];
        rows.push({ label: 'Tempo dos 150 m', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Previsão 100 m', value: `${this.fmt(this.predict100From150(t))} s` });
        break;
      }
      case 'endurance-250m': {
        const t = +values['time250'];
        rows.push({ label: 'Tempo dos 250 m', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Previsão 200 m', value: `${this.fmt(this.predict200From250(t))} s` });
        break;
      }
      case 'sprint-400m': {
        const t = +values['time400'];
        rows.push({ label: 'Tempo dos 400 m', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Média por 100 m', value: `${this.fmt(t / 4)} s` });
        break;
      }
      case 'shuttle-300yd': {
        rows.push({ label: 'Tempo dos 12 percursos', value: `${this.fmt(+values['time'])} s` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa; comparar com testes anteriores.' });
        break;
      }
      case 'dropoff-400m': {
        const t100 = +values['time100'];
        const t400 = +values['time400'];
        const split = t400 / 4;
        const dropoff = split - t100;
        rows.push({ label: 'Parcial média dos 400 m', value: `${this.fmt(split)} s / 100 m` });
        rows.push({ label: 'Drop off', value: `${this.fmt(dropoff)} s (referência de elite: ~0,7 s)` });
        break;
      }
      case 'margaria-kalamen': {
        const p = this.margariaKalamenPower(+values['massKg'], +values['verticalDistance'], +values['time']);
        rows.push({ label: 'Potência', value: `${this.fmt(p)} W` });
        break;
      }
      case 'control-400m': {
        const t150 = +values['time150'];
        const t300 = +values['time300'];
        const t600 = +values['time600'];
        const sei = this.speedEnduranceIndex(t150, t300);
        const seiTarget = this.speedEnduranceTarget(t150);
        const sge = this.strengthEnduranceIndex(t300, t600);
        const sgeTarget = this.strengthEnduranceTarget(t300);
        rows.push({ label: 'Índice de resistência de velocidade', value: `${this.fmt(sei)} (alvo ${this.fmt(seiTarget)})` });
        rows.push({
          label: 'Leitura',
          value: sei > seiTarget
            ? 'Acima do alvo: indicado mais trabalho de resistência de velocidade (lático)'
            : 'Dentro do alvo',
        });
        rows.push({ label: 'Índice de força/resistência geral', value: `${this.fmt(sge)} (alvo ${this.fmt(sgeTarget)})` });
        rows.push({
          label: 'Leitura',
          value: sge > sgeTarget
            ? 'Acima do alvo: indicado mais trabalho de força e resistência geral (aeróbico)'
            : 'Dentro do alvo',
        });
        break;
      }
      case 'sprint-fatigue': {
        const times = nums(values['times']);
        const max = Math.max(...times);
        const min = Math.min(...times);
        const avgFirst3 = (times[0] + times[1] + times[2]) / 3;
        const last = times.length;
        const avgLast3 = (times[last - 3] + times[last - 2] + times[last - 1]) / 3;
        const maintenance = avgFirst3 / avgLast3;
        rows.push({ label: 'Fadiga de sprint (mais lento − mais rápido)', value: `${this.fmt(max - min)} s` });
        rows.push({ label: 'Manutenção de potência', value: this.fmt(maintenance) });
        rows.push({ label: 'Classificação', value: this.powerMaintenanceRating(maintenance) });
        break;
      }
      case 'concept2-step': {
        const t2000 = +values['best2000'];
        const split = t2000 / 4;
        rows.push({ label: 'Pace médio de 500 m (2000 m)', value: `${this.pace(split)} /500 m` });
        rows.push({ label: 'Step 1 (4 min)', value: `${this.pace(split + 21)} /500 m` });
        rows.push({ label: 'Step 2 (4 min)', value: `${this.pace(split + 16)} /500 m` });
        rows.push({ label: 'Step 3 (4 min)', value: `${this.pace(split + 12)} /500 m` });
        rows.push({ label: 'Step 4 (4 min)', value: `${this.pace(split + 9)} /500 m` });
        rows.push({ label: 'Step 5 (4 min)', value: 'Esforço máximo' });
        rows.push({ label: 'Observação', value: 'Registre FC estável, distância, voga e pace real por step; FC menor no mesmo pace indica melhora.' });
        break;
      }
      case 'flying-30m': {
        const male = isMale(values['gender']);
        const flying = +values['time60'] - +values['time30'];
        rows.push({ label: 'Flying 30 m', value: `${this.fmt(flying)} s` });
        rows.push({ label: '% rank (classe mundial)', value: this.flying30Rank(flying, male) });
        rows.push({ label: 'Previsão 100 m', value: `${this.fmt(this.predict100FromFlying30(flying))} s` });
        rows.push({ label: 'Previsão 200 m', value: `${this.fmt(this.predict200FromFlying30(flying))} s` });
        break;
      }
      case 'kosmin': {
        const male = isMale(values['gender']);
        const event = values['event'] === '1500' ? '1500' : '800';
        const t = this.kosminPrediction(+values['totalDistance'], event, male);
        rows.push({ label: `Previsão ${event} m`, value: `${this.fmt(t)} s (${this.pace(t)})` });
        break;
      }
      case 'las': {
        const t1 = +values['time500'];
        const s1 = +values['time50'] + +values['time100'] + +values['time150'] + +values['time200'];
        const diff = t1 - s1;
        rows.push({ label: 'T1 (500 m)', value: `${this.fmt(t1)} s` });
        rows.push({ label: 'S1 (soma dos sprints)', value: `${this.fmt(s1)} s` });
        rows.push({ label: 'Diferença (T1 − S1)', value: `${this.fmt(diff)} s` });
        rows.push({
          label: 'Leitura',
          value: diff > 5
            ? 'Acima de 5 s: indica falta de endurance'
            : 'Abaixo de 5 s: indica falta de velocidade',
        });
        break;
      }
      case 'pwc170': {
        const p = this.pwc170(+values['p1'], +values['hr1'], +values['p2'], +values['hr2']);
        rows.push({ label: 'Potência projetada a 170 bpm', value: `${this.fmt(p)} W` });
        break;
      }
      case 'wingate': {
        const mass = +values['massKg'];
        const dist = +values['distPerRev'] || 6;
        const resistance = 0.075 * mass;
        const revs = nums(values['revs']);
        // trabalho por intervalo (J) = resistência (kg) x g x revoluções x distância por revolução
        const works = revs.map((r) => resistance * 9.81 * r * dist);
        const powers = works.map((w) => w / 5);
        const pp = Math.max(...powers);
        const lowest = Math.min(...powers);
        const totalWork = works.reduce((a, b) => a + b, 0);
        rows.push({ label: 'Resistência aplicada (0,075 x massa)', value: `${this.fmt(resistance)} kg` });
        rows.push({ label: 'Potência de pico (PP)', value: `${this.fmt(pp)} W` });
        rows.push({ label: 'PP relativa (RPP)', value: `${this.fmt(pp / mass)} W/kg` });
        rows.push({ label: 'Fadiga anaeróbica (AF)', value: `${this.fmt(((pp - lowest) / pp) * 100)} %` });
        rows.push({ label: 'Capacidade anaeróbica (AC)', value: `${this.fmt(totalWork)} J (média ${this.fmt(totalWork / 30)} W)` });
        break;
      }
      case 'speed-35m': {
        const t = +values['time'];
        rows.push({ label: 'Melhor tempo', value: `${this.fmt(t)} s` });
        rows.push({ label: 'Classificação (adultos)', value: this.speed35Rating(t, isMale(values['gender'])) });
        break;
      }
      case 'multiple-sprint': {
        const times = nums(values['times']);
        const total = times.reduce((a, b) => a + b, 0);
        const optimal = Math.min(...times) * 6;
        const diff = total - optimal;
        rows.push({ label: 'Tempo total', value: `${this.fmt(total)} s` });
        rows.push({ label: 'Tempo ótimo (6 x melhor)', value: `${this.fmt(optimal)} s` });
        rows.push({ label: 'Diferença (fadiga)', value: `${this.fmt(diff)} s` });
        rows.push({
          label: 'Avaliação',
          value: diff < 0.8 ? 'Excelente para um atleta sênior (< 0,8 s)' : 'Acima da referência de excelência (0,8 s)',
        });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
