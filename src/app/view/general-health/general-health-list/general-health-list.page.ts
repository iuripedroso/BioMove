import { Component } from '@angular/core';
import { GeneralHealthTestConfig } from 'src/app/model/general-health-test.model';
import { GeneralHealthTestsService } from 'src/app/model/service/general-health-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'orthostatic': 'heart-outline',
  'urine-colour': 'water-outline',
  'waist-hip': 'ellipse-outline',
};

@Component({
  selector: 'app-general-health-list',
  templateUrl: './general-health-list.page.html',
  styleUrls: ['./general-health-list.page.scss'],
})
export class GeneralHealthListPage {
  tests: GeneralHealthTestConfig[];

  constructor(private generalHealthTestsService: GeneralHealthTestsService) {
    this.tests = this.generalHealthTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
