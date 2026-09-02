import { Component } from '@angular/core';
import { SportsPsychologyTestConfig } from 'src/app/model/sports-psychology-test.model';
import { SportsPsychologyTestsService } from 'src/app/model/service/sports-psychology-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'scat': 'pulse-outline',
  'teosq': 'ribbon-outline',
};

@Component({
  selector: 'app-sports-psychology-list',
  templateUrl: './sports-psychology-list.page.html',
  styleUrls: ['./sports-psychology-list.page.scss'],
})
export class SportsPsychologyListPage {
  tests: SportsPsychologyTestConfig[];

  constructor(private sportsPsychologyTestsService: SportsPsychologyTestsService) {
    this.tests = this.sportsPsychologyTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
