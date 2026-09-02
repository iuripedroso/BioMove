import { Injectable } from '@angular/core';
import { EnduranceTestsService } from './endurance-tests.service';
import { AgilityTestsService } from './agility-tests.service';
import { MobilityTestsService } from './mobility-tests.service';
import { BodyCompositionTestsService } from './body-composition-tests.service';
import { StrengthTestsService } from './strength-tests.service';
import { SpeedPowerTestsService } from './speed-power-tests.service';
import { SportsPsychologyTestsService } from './sports-psychology-tests.service';
import { GeneralHealthTestsService } from './general-health-tests.service';

/** Entrada do catálogo: um teste com a categoria a que pertence. */
export interface CatalogEntry {
  /** slug da categoria (rota) */
  categoryId: string;
  /** código do teste no livro, ex: '6.19' */
  code: string;
  /** slug do teste (rota) */
  testId: string;
  name: string;
  objective: string;
}

/**
 * Catálogo unificado dos 101 testes de todos os capítulos, para consultas
 * transversais (total de testes, destaque do dia e, futuramente, busca).
 */
@Injectable({
  providedIn: 'root',
})
export class TestCatalogService {
  constructor(
    private enduranceTestsService: EnduranceTestsService,
    private agilityTestsService: AgilityTestsService,
    private mobilityTestsService: MobilityTestsService,
    private bodyCompositionTestsService: BodyCompositionTestsService,
    private strengthTestsService: StrengthTestsService,
    private speedPowerTestsService: SpeedPowerTestsService,
    private sportsPsychologyTestsService: SportsPsychologyTestsService,
    private generalHealthTestsService: GeneralHealthTestsService
  ) {}

  /** Todos os testes de todos os capítulos, na ordem do livro. */
  getAll(): CatalogEntry[] {
    const sources: [string, { getTests(): any[] }][] = [
      ['endurance', this.enduranceTestsService],
      ['agility', this.agilityTestsService],
      ['mobility', this.mobilityTestsService],
      ['body-composition', this.bodyCompositionTestsService],
      ['strength', this.strengthTestsService],
      ['speed-power', this.speedPowerTestsService],
      ['sports-psychology', this.sportsPsychologyTestsService],
      ['general-health', this.generalHealthTestsService],
    ];
    const entries: CatalogEntry[] = [];
    for (const [categoryId, service] of sources) {
      for (const t of service.getTests()) {
        entries.push({
          categoryId,
          code: t.code,
          testId: t.id,
          name: t.name,
          objective: t.objective,
        });
      }
    }
    return entries;
  }

  /** Total de testes disponíveis no app. */
  count(): number {
    return this.getAll().length;
  }

  /**
   * Teste em destaque do dia: escolha determinística pela data, para que
   * o destaque seja o mesmo o dia inteiro e mude à meia-noite.
   */
  featuredOfTheDay(): CatalogEntry {
    const all = this.getAll();
    const today = new Date();
    // seed AAAAMMDD garante a mesma escolha durante o dia todo
    const seed =
      today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return all[seed % all.length];
  }
}
