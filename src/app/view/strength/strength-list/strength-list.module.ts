import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StrengthListPage } from './strength-list.page';

import { StrengthListPageRoutingModule } from './strength-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, StrengthListPageRoutingModule],
  declarations: [StrengthListPage],
})
export class StrengthListPageModule {}
