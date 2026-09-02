import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CategoryGridComponent } from './category-grid/category-grid.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [CategoryGridComponent],
  exports: [CategoryGridComponent],
})
export class SharedModule {}
