import { Component } from '@angular/core';
import { MobilityTestConfig } from 'src/app/model/mobility-test.model';
import { MobilityTestsService } from 'src/app/model/service/mobility-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'modified-sit-reach': 'resize-outline',
  'sit-reach': 'resize-outline',
  'hip-flexion': 'body-outline',
  'ankle-flexibility': 'walk-outline',
  'hip-trunk-flexibility': 'accessibility-outline',
  'shoulder-flexibility': 'sync-outline',
  'shoulder-wrist-flexibility': 'hand-left-outline',
  'trunk-neck-flexibility': 'arrow-up-outline',
  'trunk-flexion': 'return-down-forward-outline',
  'standing-stork': 'man-outline',
  'standing-stork-blind': 'eye-off-outline',
};

@Component({
  selector: 'app-mobility-list',
  templateUrl: './mobility-list.page.html',
  styleUrls: ['./mobility-list.page.scss'],
})
export class MobilityListPage {
  tests: MobilityTestConfig[];

  constructor(private mobilityTestsService: MobilityTestsService) {
    this.tests = this.mobilityTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
