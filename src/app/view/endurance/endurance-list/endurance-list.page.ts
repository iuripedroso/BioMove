import { Component } from '@angular/core';
import { EnduranceTestConfig } from 'src/app/model/endurance-test.model';
import { EnduranceTestsService } from 'src/app/model/service/endurance-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'astrand-treadmill': 'walk-outline',
  'balke-treadmill': 'walk-outline',
  'balke-vo2max': 'flag-outline',
  'bruce-treadmill': 'walk-outline',
  'run-24km': 'flag-outline',
  conconi: 'pulse-outline',
  'cooper-vo2max': 'flag-outline',
  css: 'water-outline',
  'harvard-step': 'footsteps-outline',
  'astrand-cycle': 'bicycle-outline',
  'home-step': 'footsteps-outline',
  'three-min-step': 'footsteps-outline',
  msft: 'swap-horizontal-outline',
  'queens-college-step': 'footsteps-outline',
  rockport: 'walk-outline',
  tecumseh: 'footsteps-outline',
  'treadmill-vo2max': 'walk-outline',
  'one-mile-jog': 'flag-outline',
  'non-exercise-vo2max': 'clipboard-outline',
  rast: 'flash-outline',
  'tri-level-aerobic': 'bicycle-outline',
  'tri-level-lactic': 'bicycle-outline',
  'tri-level-alactic': 'bicycle-outline',
  'cunningham-faulkner': 'walk-outline',
};

@Component({
  selector: 'app-endurance-list',
  templateUrl: './endurance-list.page.html',
  styleUrls: ['./endurance-list.page.scss'],
})
export class EnduranceListPage {
  tests: EnduranceTestConfig[];

  constructor(private enduranceTestsService: EnduranceTestsService) {
    this.tests = this.enduranceTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'fitness-outline';
  }
}
