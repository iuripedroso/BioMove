import { Component } from '@angular/core';
import { SpeedPowerTestConfig } from 'src/app/model/speed-power-test.model';
import { SpeedPowerTestsService } from 'src/app/model/service/speed-power-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'ten-stride': 'footsteps-outline',
  'accel-30m': 'speedometer-outline',
  'speed-60m': 'flash-outline',
  'shuttle-run': 'swap-horizontal-outline',
  'endurance-150m': 'timer-outline',
  'endurance-250m': 'timer-outline',
  'sprint-400m': 'stopwatch-outline',
  'shuttle-300yd': 'repeat-outline',
  'dropoff-400m': 'trending-down-outline',
  'margaria-kalamen': 'trending-up-outline',
  'control-400m': 'options-outline',
  'sprint-40m': 'flash-outline',
  'sprint-fatigue': 'battery-half-outline',
  'concept2-step': 'boat-outline',
  'flying-30m': 'airplane-outline',
  'kosmin': 'calculator-outline',
  'las': 'git-compare-outline',
  'pwc170': 'bicycle-outline',
  'wingate': 'bicycle-outline',
  'speed-35m': 'flash-outline',
  'multiple-sprint': 'repeat-outline',
};

@Component({
  selector: 'app-speed-power-list',
  templateUrl: './speed-power-list.page.html',
  styleUrls: ['./speed-power-list.page.scss'],
})
export class SpeedPowerListPage {
  tests: SpeedPowerTestConfig[];

  constructor(private speedPowerTestsService: SpeedPowerTestsService) {
    this.tests = this.speedPowerTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
