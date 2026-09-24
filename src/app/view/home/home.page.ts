import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/model/service/auth.service';
import { TestCategoriesService } from 'src/app/model/service/test-categories.service';
import { TestCategory } from 'src/app/model/test-category.model';
import {
  RecentTest,
  RecentTestsService,
} from 'src/app/model/service/recent-tests.service';
import {
  CatalogEntry,
  TestCatalogService,
} from 'src/app/model/service/test-catalog.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public user: any;
  public categories: TestCategory[];
  public recents: RecentTest[] = [];
  public featured: CatalogEntry;
  public totalTests: number;

  constructor(
    private router: Router,
    private authService: AuthService,
    private testCategoriesService: TestCategoriesService,
    private recentTestsService: RecentTestsService,
    private testCatalogService: TestCatalogService
  ) {
    this.user = this.authService.getUserLogged();
    this.categories = this.testCategoriesService.getCategories();
    this.featured = this.testCatalogService.featuredOfTheDay();
    this.totalTests = this.testCatalogService.count();
  }

  async ionViewWillEnter() {
    this.user = this.authService.getUserLogged();
    this.recents = await this.recentTestsService.list();
  }

  /** Saudação conforme o horário do dia. */
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 5) { return 'Boa madrugada'; }
    if (hour < 12) { return 'Bom dia'; }
    if (hour < 18) { return 'Boa tarde'; }
    return 'Boa noite';
  }

  /** Cor de destaque da categoria de um teste (para chips e destaque). */
  accentOf(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.accent ?? '#888888';
  }

  /** Nome da categoria de um teste, para o subtítulo do destaque. */
  categoryNameOf(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.name ?? '';
  }

  openTest(categoryId: string, testId: string) {
    this.router.navigate(['/tabs/testes', categoryId, testId]);
  }

  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['sign-in']);
    });
  }
}
