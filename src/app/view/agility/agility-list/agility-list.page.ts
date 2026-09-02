import { Component } from '@angular/core';
import { AgilityTestConfig } from 'src/app/model/agility-test.model';
import { AgilityTestsService } from 'src/app/model/service/agility-tests.service';

/** Ícone (ionicon) representativo por tipo de teste, para leitura visual rápida da lista. */
const TEST_ICONS: Record<string, string> = {
  'hexagonal-obstacle': 'apps-outline',
  'zig-zag': 'trending-up-outline',
  'agility-505': 'swap-horizontal-outline',
  'illinois-agility': 'navigate-outline',
  'lateral-change': 'resize-outline',
  'quick-feet': 'footsteps-outline',
  burpee: 'body-outline',
  't-drill': 'git-network-outline',
};

@Component({
  selector: 'app-agility-list',
  templateUrl: './agility-list.page.html',
  styleUrls: ['./agility-list.page.scss'],
})
export class AgilityListPage {
  tests: AgilityTestConfig[];

  constructor(private agilityTestsService: AgilityTestsService) {
    this.tests = this.agilityTestsService.getTests();
  }

  iconFor(testId: string): string {
    return TEST_ICONS[testId] ?? 'flash-outline';
  }
}
