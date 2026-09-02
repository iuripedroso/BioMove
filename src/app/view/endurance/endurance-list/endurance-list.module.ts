import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EnduranceListPage } from './endurance-list.page';

import { EnduranceListPageRoutingModule } from './endurance-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, EnduranceListPageRoutingModule],
  declarations: [EnduranceListPage],
})
export class EnduranceListPageModule {}
