import { Component } from '@angular/core';
import { BodyCompositionTestConfig } from 'src/app/model/body-composition-test.model';
import { BodyCompositionTestsService } from 'src/app/model/service/body-composition-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'bmi': 'speedometer-outline',
  'body-fat-percentage': 'analytics-outline',
  'jackson-pollock': 'stats-chart-outline',
  'yuhasz': 'bar-chart-outline',
};

@Component({
  selector: 'app-body-composition-list',
  templateUrl: './body-composition-list.page.html',
  styleUrls: ['./body-composition-list.page.scss'],
})
export class BodyCompositionListPage {
  tests: BodyCompositionTestConfig[];

  constructor(private bodyCompositionTestsService: BodyCompositionTestsService) {
    this.tests = this.bodyCompositionTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
