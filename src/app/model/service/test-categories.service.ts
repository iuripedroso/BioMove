import { Injectable } from '@angular/core';
import { TestCategory } from '../test-category.model';
import { EnduranceTestsService } from './endurance-tests.service';
import { AgilityTestsService } from './agility-tests.service';
import { MobilityTestsService } from './mobility-tests.service';
import { BodyCompositionTestsService } from './body-composition-tests.service';
import { StrengthTestsService } from './strength-tests.service';
import { SpeedPowerTestsService } from './speed-power-tests.service';
import { SportsPsychologyTestsService } from './sports-psychology-tests.service';
import { GeneralHealthTestsService } from './general-health-tests.service';

/**
 * Catálogo das categorias de teste (capítulos do livro). Cada capítulo vira
 * uma entrada aqui; todos os 8 capítulos do livro estão implementados.
 */
@Injectable({
  providedIn: 'root',
})
export class TestCategoriesService {
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

  getCategories(): TestCategory[] {
    return [
      {
        id: 'endurance',
        code: '1',
        name: 'Endurance',
        description: 'Testes de resistência aeróbica e anaeróbica (VO2max, step tests, sprints).',
        icon: 'heart-outline',
        available: true,
        testCount: this.enduranceTestsService.getTests().length,
        accent: '#e63946',
      },
      {
        id: 'agility',
        code: '2',
        name: 'Agilidade',
        description: 'Mudança de direção, tempo de reação e coordenação.',
        icon: 'flash-outline',
        available: true,
        testCount: this.agilityTestsService.getTests().length,
        accent: '#f4a301',
      },
      {
        id: 'mobility',
        code: '3',
        name: 'Mobilidade e Equilíbrio',
        description: 'Flexibilidade articular e controle postural.',
        icon: 'body-outline',
        available: true,
        testCount: this.mobilityTestsService.getTests().length,
        accent: '#2a9d8f',
      },
      {
        id: 'body-composition',
        code: '4',
        name: 'Composição Corporal',
        description: 'IMC, percentual de gordura e dobras cutâneas.',
        icon: 'analytics-outline',
        available: true,
        testCount: this.bodyCompositionTestsService.getTests().length,
        accent: '#7b6ef6',
      },
      {
        id: 'strength',
        code: '5',
        name: 'Força',
        description: 'Força muscular máxima e resistência de força.',
        icon: 'barbell-outline',
        available: true,
        testCount: this.strengthTestsService.getTests().length,
        accent: '#e76f51',
      },
      {
        id: 'speed-power',
        code: '6',
        name: 'Velocidade e Potência',
        description: 'Sprints, potência de membros inferiores e testes de carga.',
        icon: 'speedometer-outline',
        available: true,
        testCount: this.speedPowerTestsService.getTests().length,
        accent: '#0096c7',
      },
      {
        id: 'sports-psychology',
        code: '7',
        name: 'Psicologia Esportiva',
        description: 'Ansiedade competitiva e orientação motivacional.',
        icon: 'happy-outline',
        available: true,
        testCount: this.sportsPsychologyTestsService.getTests().length,
        accent: '#c2559d',
      },
      {
        id: 'general-health',
        code: '8',
        name: 'Saúde Geral',
        description: 'FC ortostática, hidratação e relação cintura-quadril.',
        icon: 'medkit-outline',
        available: true,
        testCount: this.generalHealthTestsService.getTests().length,
        accent: '#00b878',
      },
    ];
  }
}
