import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SportsPsychologyListPage } from './sports-psychology-list.page';

import { SportsPsychologyListPageRoutingModule } from './sports-psychology-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, SportsPsychologyListPageRoutingModule],
  declarations: [SportsPsychologyListPage],
})
export class SportsPsychologyListPageModule {}
