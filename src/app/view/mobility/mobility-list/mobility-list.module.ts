import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MobilityListPage } from './mobility-list.page';

import { MobilityListPageRoutingModule } from './mobility-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, MobilityListPageRoutingModule],
  declarations: [MobilityListPage],
})
export class MobilityListPageModule {}
