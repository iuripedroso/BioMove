import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TestCategory } from 'src/app/model/test-category.model';

@Component({
  selector: 'app-category-grid',
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss'],
})
export class CategoryGridComponent {
  @Input() categories: TestCategory[] = [];

  constructor(private router: Router) {}

  abrir(category: TestCategory) {
    if (!category.available) {
      return;
    }
    this.router.navigate(['/tabs/testes', category.id]);
  }
}
