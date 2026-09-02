import { Injectable } from '@angular/core';
import {
  AgilityTestConfig,
  AgilityTestResult,
  AgilityTestResultRow,
} from '../agility-test.model';

/**
 * Serviço com os cálculos dos 8 testes de Agilidade (Capítulo 2) do livro
 * "101 Performance Evaluation Tests" (Brian Mackenzie, Electric Word plc, 2005).
 *
 * Cada método implementa apenas a análise do teste (média/melhor tempo,
 * escore e classificação nas tabelas normativas do livro), não o protocolo
 * de aplicação em si (que envolve cones, cronometragem, etc. e deve ser
 * conduzido pelo avaliador).
 *
 * Convenções:
 * - Tempos sempre em segundos e frações de segundo (ex: 13,45 s = 13.45)
 */
@Injectable({
  providedIn: 'root',
})
export class AgilityTestsService {
  // ---------------------------------------------------------------------
  // 2.1 Hexagonal Obstacle Test
  // ---------------------------------------------------------------------
  /** Média das duas tentativas (3 circuitos cada). */
  hexagonalObstacleAverage(trial1Seconds: number, trial2Seconds: number): number {
    return (trial1Seconds + trial2Seconds) / 2;
  }

  /**
   * Classificação segundo as normas nacionais (16 a 19 anos) —
   * Arnot R e Gaines C, Sports Talent, 1984.
   */
  hexagonalObstacleRating(averageSeconds: number, male: boolean): string {
    const t = averageSeconds;
    if (male) {
      if (t < 11.2) { return 'Excelente'; }
      if (t <= 13.3) { return 'Acima da média'; }
      if (t <= 15.5) { return 'Média'; }
      if (t <= 17.8) { return 'Abaixo da média'; }
      return 'Fraco';
    }
    if (t < 12.2) { return 'Excelente'; }
    if (t <= 15.3) { return 'Acima da média'; }
    if (t <= 18.5) { return 'Média'; }
    if (t <= 21.8) { return 'Abaixo da média'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 2.2 Zig-Zag Test
  // ---------------------------------------------------------------------
  /**
   * Não há tabela normativa publicada; o teste é avaliado por comparação
   * com testes anteriores do mesmo atleta. Este helper só repassa o tempo
   * do circuito.
   */
  zigZagTime(timeSeconds: number): number {
    return timeSeconds;
  }

  // ---------------------------------------------------------------------
  // 2.3 505 Agility Test
  // ---------------------------------------------------------------------
  /** Melhor tempo entre as duas tentativas. */
  agility505Best(trial1Seconds: number, trial2Seconds: number): number {
    return Math.min(trial1Seconds, trial2Seconds);
  }

  // ---------------------------------------------------------------------
  // 2.4 Illinois Agility Run Test
  // ---------------------------------------------------------------------
  /**
   * Classificação segundo as normas nacionais (16 a 19 anos) —
   * Davis B. et al, Physical Education and the Study of Sport, 2000.
   */
  illinoisAgilityRating(timeSeconds: number, male: boolean): string {
    const t = timeSeconds;
    if (male) {
      if (t < 15.2) { return 'Excelente'; }
      if (t <= 16.1) { return 'Acima da média'; }
      if (t <= 18.1) { return 'Média'; }
      if (t <= 18.3) { return 'Abaixo da média'; }
      return 'Fraco';
    }
    if (t < 17.0) { return 'Excelente'; }
    if (t <= 17.9) { return 'Acima da média'; }
    if (t <= 21.7) { return 'Média'; }
    if (t <= 23.0) { return 'Abaixo da média'; }
    return 'Fraco';
  }

  // ---------------------------------------------------------------------
  // 2.5 Lateral Change of Direction Test
  // ---------------------------------------------------------------------
  /**
   * % Rank a partir do tempo, segundo a tabela de atletas de classe mundial —
   * D.A. Chu, Explosive Power and Strength, Human Kinetics, 1996.
   * Faixas de 0,16 s: homens de 3,22 s (91-100) a 4,81 s (1-10);
   * mulheres de 2,90 s a 4,49 s.
   */
  lateralChangeOfDirectionRank(timeSeconds: number, male: boolean): string {
    const min = male ? 3.22 : 2.9;
    const max = male ? 4.81 : 4.49;
    if (timeSeconds < min) { return '91-100 (acima da tabela)'; }
    if (timeSeconds > max) { return '1-10 (abaixo da tabela)'; }
    // 10 faixas de 0,16 s, da mais rápida (91-100) para a mais lenta (1-10)
    const band = Math.min(9, Math.floor((timeSeconds - min) / 0.16));
    const low = 91 - band * 10;
    return `${low}-${low + 9}`;
  }

  // ---------------------------------------------------------------------
  // 2.6 Quick Feet Test
  // ---------------------------------------------------------------------
  /**
   * Tempo de referência ("excelente") para percorrer a escada de 20 degraus,
   * por nível escolar/universitário.
   */
  quickFeetStandard(level: string, male: boolean): number {
    switch (level) {
      case 'jnr-high':
        return male ? 3.8 : 4.2;
      case 'snr-high':
        return male ? 3.3 : 3.8;
      default: // college
        return male ? 2.8 : 3.4;
    }
  }

  // ---------------------------------------------------------------------
  // 2.7 Burpee Test
  // ---------------------------------------------------------------------
  /**
   * Escore em 15 segundos: 1 ponto por repetição completa, menos 0,5 ponto
   * por repetição com técnica ruim.
   */
  burpeeScore(completedReps: number, poorTechniqueReps: number): number {
    return completedReps - 0.5 * poorTechniqueReps;
  }

  // ---------------------------------------------------------------------
  // 2.8 'T' Drill Test
  // ---------------------------------------------------------------------
  /**
   * Não há tabela normativa publicada; o teste é avaliado por comparação
   * com testes anteriores do mesmo atleta.
   */
  tDrillTime(timeSeconds: number): number {
    return timeSeconds;
  }

  private static readonly GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  /** Metadados (nome, objetivo e campos de entrada) dos 8 testes de Agilidade. */
  getTests(): AgilityTestConfig[] {
    return [
      {
        id: 'hexagonal-obstacle',
        code: '2.1',
        name: 'Hexagonal Obstacle Test',
        objective: 'Monitorar a agilidade do atleta com saltos sobre as linhas de um hexágono.',
        requiredResources: [
          'Hexágono de 66 cm de lado marcado no chão',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'O atleta fica no centro do hexágono, de frente para a linha A, e mantém essa orientação durante todo o teste',
          'Ao comando "JÁ", o cronômetro é acionado e o atleta salta com os dois pés sobre a linha B e volta ao centro, depois sobre a linha C e volta, e assim por diante',
          'Ao saltar sobre a linha A e voltar ao centro, completa-se 1 circuito',
          'O atleta completa 3 circuitos; ao final, parar o cronômetro e registrar o tempo',
          'Após descanso, repetir o teste e calcular a média das duas tentativas',
          'Se o atleta saltar a linha errada ou pisar em uma linha, o teste recomeça',
        ],
        analysisNote:
          'Compare a média das duas tentativas com avaliações anteriores do mesmo atleta e com a tabela normativa (16 a 19 anos) — espera-se evolução progressiva com o treinamento adequado.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: AgilityTestsService.GENDER_OPTIONS },
          { key: 'trial1', label: 'Tempo da 1ª tentativa', type: 'number', unit: 's', step: 0.01 },
          { key: 'trial2', label: 'Tempo da 2ª tentativa', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'zig-zag',
        code: '2.2',
        name: 'Zig-Zag Test',
        objective: 'Monitorar a velocidade e a agilidade do atleta em um circuito em zigue-zague.',
        requiredResources: [
          '5 cones',
          'Superfície antiderrapante',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Marcar o percurso com 4 cones nos cantos de um retângulo de 10 x 16 pés (aprox. 3 x 4,9 m) e 1 cone no centro',
          'O atleta percorre a rota em zigue-zague indicada no diagrama do teste',
          'O atleta completa 1 volta no circuito, começando e terminando no cone de partida/chegada',
          'O auxiliar registra o tempo para completar o percurso',
        ],
        analysisNote:
          'Não há tabela normativa publicada; compare o tempo com avaliações anteriores do mesmo atleta — espera-se evolução progressiva com o treinamento adequado.',
        fields: [{ key: 'timeSeconds', label: 'Tempo do circuito', type: 'number', unit: 's', step: 0.01 }],
      },
      {
        id: 'agility-505',
        code: '2.3',
        name: '505 Agility Test',
        objective: 'Monitorar a velocidade e a agilidade do atleta em uma mudança de direção de 180 graus.',
        requiredResources: [
          '6 cones',
          'Trena',
          'Superfície antiderrapante',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Marcar o percurso: 10 m da linha de partida (A) até a linha dos 10 m (B) e 5 m de B até a linha dos 15 m (C)',
          'O atleta corre da linha de partida (A) em direção à linha B (distância de embalo para ganhar velocidade)',
          'O auxiliar aciona o cronômetro quando o atleta cruza a linha B',
          'O atleta segue até a linha C, gira 180° e corre de volta em direção à partida',
          'O auxiliar para o cronômetro quando o atleta cruza novamente a linha B no retorno',
          'Registrar o melhor tempo de duas tentativas',
        ],
        analysisNote:
          'Não há tabela normativa publicada; compare o melhor tempo com avaliações anteriores do mesmo atleta — espera-se evolução progressiva com o treinamento adequado.',
        fields: [
          { key: 'trial1', label: 'Tempo da 1ª tentativa', type: 'number', unit: 's', step: 0.01 },
          { key: 'trial2', label: 'Tempo da 2ª tentativa', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'illinois-agility',
        code: '2.4',
        name: 'Illinois Agility Run Test',
        objective: 'Monitorar o desenvolvimento da velocidade e da agilidade do atleta.',
        requiredResources: [
          'Superfície plana (pista de 400 m)',
          '8 cones',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Montar o percurso: 10 m de comprimento por 5 m de largura (entre partida e chegada); 4 cones marcam partida, chegada e os 2 pontos de virada; os 4 cones centrais ficam espaçados 3,3 m entre si',
          'O atleta deita de bruços no ponto de partida',
          'Ao comando do auxiliar, o atleta se levanta e percorre o circuito contornando os cones até a chegada',
          'O auxiliar registra o tempo total do comando até a conclusão do percurso',
        ],
        analysisNote:
          'Compare o tempo com avaliações anteriores do mesmo atleta e com a tabela normativa (16 a 19 anos) — a correlação com o nível de aptidão é alta.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: AgilityTestsService.GENDER_OPTIONS },
          { key: 'timeSeconds', label: 'Tempo total', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'lateral-change',
        code: '2.5',
        name: 'Lateral Change of Direction Test',
        objective: 'Monitorar o desenvolvimento da velocidade do atleta com mudança de direção.',
        requiredResources: [
          'Superfície plana (pista)',
          '3 cones',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Posicionar 3 cones em linha reta, com 5 m entre eles; o atleta parte do cone do meio',
          'O auxiliar dá o sinal de partida apontando uma direção (direita ou esquerda) e aciona o cronômetro no comando "JÁ"',
          'O atleta corre até o primeiro cone e o toca, retorna passando pelo cone do meio até o cone oposto, toca-o e volta ao cone do meio, tocando-o',
          'O cronômetro é parado quando o atleta toca o cone do meio',
          'Registrar a melhor de duas tentativas em cada direção de partida (direita e esquerda)',
        ],
        analysisNote:
          'Compare os tempos com avaliações anteriores do mesmo atleta e com a tabela de % rank obtida com atletas de classe mundial (D.A. Chu, 1996).',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: AgilityTestsService.GENDER_OPTIONS },
          { key: 'bestRight', label: 'Melhor tempo partindo à direita', type: 'number', unit: 's', step: 0.01 },
          { key: 'bestLeft', label: 'Melhor tempo partindo à esquerda', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'quick-feet',
        code: '2.6',
        name: 'Quick Feet Test',
        objective: 'Indicar a presença de fibras de contração rápida e o potencial para movimentos velozes.',
        requiredResources: [
          'Superfície plana',
          '20 bastões de 60 cm (2 pés) ou escada de agilidade com 20 degraus',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Posicionar os 20 bastões com 45 cm (18 pol) entre eles, ou a escada de 20 degraus, na grama ou pista',
          'O atleta bombeia os braços vigorosamente (como no sprint) e usa pouca elevação de joelhos, correndo pela escada sem tocar os bastões/degraus (um pé em cada espaço)',
          'O cronômetro é acionado quando o pé do atleta toca o solo entre o 1º e o 2º bastão e parado no primeiro contato com o solo após o último bastão',
          'Registrar a melhor de duas tentativas',
        ],
        analysisNote:
          'Compare o tempo com o padrão "excelente" da categoria do atleta: menos de 2,8 s (homens) e 3,4 s (mulheres) para universitários é considerado excelente.',
        fields: [
          { key: 'gender', label: 'Sexo', type: 'select', options: AgilityTestsService.GENDER_OPTIONS },
          {
            key: 'level',
            label: 'Categoria',
            type: 'select',
            options: [
              { value: 'jnr-high', label: 'Ensino fundamental (Jnr High School)' },
              { value: 'snr-high', label: 'Ensino médio (Snr High School)' },
              { value: 'college', label: 'Universitário (College)' },
            ],
          },
          { key: 'bestTime', label: 'Melhor tempo', type: 'number', unit: 's', step: 0.01 },
        ],
      },
      {
        id: 'burpee',
        code: '2.7',
        name: 'Burpee Test',
        objective: 'Avaliar a agilidade e o equilíbrio do atleta.',
        requiredResources: [
          'Superfície seca',
          'Auxiliar',
        ],
        protocol: [
          'O atleta pratica a técnica: em pé com braços ao lado do corpo → mãos no chão à frente dos pés (agachamento) → pernas lançadas para trás em posição de flexão (linha reta dos ombros aos calcanhares) → retorno ao agachamento → retorno à posição inicial',
          'O atleta executa o máximo de repetições possível em 15 segundos',
          '1 ponto por repetição completada com sucesso',
          'Descontar 0,5 ponto por repetição com técnica ruim (não voltar totalmente à posição ereta, chutar os pés para trás antes de apoiar as mãos, não manter o corpo reto na flexão)',
        ],
        analysisNote:
          'Não há tabela normativa publicada; compare o escore com avaliações anteriores do mesmo atleta — espera-se evolução progressiva com o treinamento adequado.',
        fields: [
          { key: 'completedReps', label: 'Repetições completas em 15 s', type: 'number', min: 0, step: 1 },
          { key: 'poorTechniqueReps', label: 'Repetições com técnica ruim', type: 'number', min: 0, step: 1 },
        ],
      },
      {
        id: 't-drill',
        code: '2.8',
        name: "'T' Drill Test",
        objective: 'Monitorar o desenvolvimento da velocidade do atleta com mudança de direção.',
        requiredResources: [
          'Superfície plana',
          '4 cones',
          'Cronômetro',
          'Auxiliar',
        ],
        protocol: [
          'Posicionar 3 cones em linha reta com 5 m entre eles e um 4º cone a 10 m do cone do meio, formando um "T"; o atleta parte do cone da base do T',
          'O auxiliar dá o comando "JÁ" e aciona o cronômetro',
          'O atleta corre até o cone do meio e o toca',
          'Desloca-se lateralmente 5 m até o cone da esquerda e o toca',
          'Desloca-se lateralmente 10 m até o cone da extremidade oposta e o toca',
          'Desloca-se lateralmente 5 m de volta ao cone do meio, tocando-o',
          'Corre 10 m de costas até o cone da base do T e o toca; o cronômetro é parado e o tempo registrado',
        ],
        analysisNote:
          'Não há tabela normativa publicada; compare o tempo com avaliações anteriores do mesmo atleta — espera-se evolução progressiva com o treinamento adequado.',
        fields: [{ key: 'timeSeconds', label: 'Tempo total', type: 'number', unit: 's', step: 0.01 }],
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
  calculate(testId: string, values: Record<string, any>): AgilityTestResult {
    const rows: AgilityTestResultRow[] = [];
    const isMale = (g: any) => g === 'M' || g === 1 || g === '1';

    switch (testId) {
      case 'hexagonal-obstacle': {
        const average = this.hexagonalObstacleAverage(+values['trial1'], +values['trial2']);
        const rating = this.hexagonalObstacleRating(average, isMale(values['gender']));
        rows.push({ label: 'Média das 2 tentativas', value: `${this.fmt(average)} s` });
        rows.push({ label: 'Classificação (16-19 anos)', value: rating });
        break;
      }
      case 'zig-zag': {
        const time = this.zigZagTime(+values['timeSeconds']);
        rows.push({ label: 'Tempo do circuito', value: `${this.fmt(time)} s` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa publicada; comparar com testes anteriores.' });
        break;
      }
      case 'agility-505': {
        const best = this.agility505Best(+values['trial1'], +values['trial2']);
        rows.push({ label: 'Melhor tempo', value: `${this.fmt(best)} s` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa publicada; comparar com testes anteriores.' });
        break;
      }
      case 'illinois-agility': {
        const time = +values['timeSeconds'];
        const rating = this.illinoisAgilityRating(time, isMale(values['gender']));
        rows.push({ label: 'Tempo total', value: `${this.fmt(time)} s` });
        rows.push({ label: 'Classificação (16-19 anos)', value: rating });
        break;
      }
      case 'lateral-change': {
        const male = isMale(values['gender']);
        const right = +values['bestRight'];
        const left = +values['bestLeft'];
        rows.push({
          label: 'Partida à direita',
          value: `${this.fmt(right)} s (% rank ${this.lateralChangeOfDirectionRank(right, male)})`,
        });
        rows.push({
          label: 'Partida à esquerda',
          value: `${this.fmt(left)} s (% rank ${this.lateralChangeOfDirectionRank(left, male)})`,
        });
        break;
      }
      case 'quick-feet': {
        const best = +values['bestTime'];
        const standard = this.quickFeetStandard(String(values['level']), isMale(values['gender']));
        rows.push({ label: 'Melhor tempo', value: `${this.fmt(best)} s` });
        rows.push({ label: 'Padrão "excelente" da categoria', value: `< ${this.fmt(standard)} s` });
        rows.push({
          label: 'Avaliação',
          value: best < standard ? 'Excelente para a categoria' : 'Abaixo do padrão "excelente" da categoria',
        });
        break;
      }
      case 'burpee': {
        const score = this.burpeeScore(+values['completedReps'], +values['poorTechniqueReps']);
        rows.push({ label: 'Escore (15 s)', value: `${this.fmt(score)} pontos` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa publicada; comparar com testes anteriores.' });
        break;
      }
      case 't-drill': {
        const time = this.tDrillTime(+values['timeSeconds']);
        rows.push({ label: 'Tempo total', value: `${this.fmt(time)} s` });
        rows.push({ label: 'Observação', value: 'Sem tabela normativa publicada; comparar com testes anteriores.' });
        break;
      }
      default:
        rows.push({ label: 'Erro', value: `Teste "${testId}" não encontrado.` });
    }

    return { rows };
  }
}
