import { Component } from '@angular/core';
import { StrengthTestConfig } from 'src/app/model/strength-test.model';
import { StrengthTestsService } from 'src/app/model/service/strength-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'core-strength': 'shield-outline',
  'curl-up': 'refresh-outline',
  'canadian-crunch': 'repeat-outline',
  'sit-ups': 'sync-circle-outline',
  'jumps-decathlon': 'trending-up-outline',
  'leg-strength': 'walk-outline',
  'standing-long-jump': 'arrow-forward-outline',
  'sprint-bound-index': 'footsteps-outline',
  'sergeant-jump': 'arrow-up-outline',
  'chin-up': 'remove-outline',
  'grip-strength': 'hand-right-outline',
  'mb-javelin-quadrathlon': 'baseball-outline',
  'press-ups': 'chevron-down-outline',
  'bench-press': 'barbell-outline',
  'universal-bench-press': 'barbell-outline',
  'metronome-bench-press': 'timer-outline',
  'overhead-press': 'barbell-outline',
  'leg-press': 'fitness-outline',
  'leg-curl': 'fitness-outline',
  'knee-extension': 'fitness-outline',
  'biceps-curl': 'fitness-outline',
  'squats': 'body-outline',
  'handgrip-strength': 'hand-left-outline',
  'flexed-arm-hang': 'stopwatch-outline',
  'wall-squat': 'square-outline',
  'mccloy': 'list-outline',
  'quadrathlon': 'apps-outline',
  'wilf-paish': 'american-football-outline',
};

@Component({
  selector: 'app-strength-list',
  templateUrl: './strength-list.page.html',
  styleUrls: ['./strength-list.page.scss'],
})
export class StrengthListPage {
  tests: StrengthTestConfig[];

  constructor(private strengthTestsService: StrengthTestsService) {
    this.tests = this.strengthTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
