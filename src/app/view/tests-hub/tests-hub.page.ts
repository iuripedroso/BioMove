import { Component } from '@angular/core';
import { TestCategory } from 'src/app/model/test-category.model';
import { TestCategoriesService } from 'src/app/model/service/test-categories.service';

@Component({
  selector: 'app-tests-hub',
  templateUrl: './tests-hub.page.html',
  styleUrls: ['./tests-hub.page.scss'],
})
export class TestsHubPage {
  categories: TestCategory[];

  constructor(private testCategoriesService: TestCategoriesService) {
    this.categories = this.testCategoriesService.getCategories();
  }
}
