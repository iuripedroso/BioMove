import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GeneralHealthListPage } from './general-health-list.page';

import { GeneralHealthListPageRoutingModule } from './general-health-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, GeneralHealthListPageRoutingModule],
  declarations: [GeneralHealthListPage],
})
export class GeneralHealthListPageModule {}
