import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AgilityListPage } from './agility-list.page';

import { AgilityListPageRoutingModule } from './agility-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, AgilityListPageRoutingModule],
  declarations: [AgilityListPage],
})
export class AgilityListPageModule {}
