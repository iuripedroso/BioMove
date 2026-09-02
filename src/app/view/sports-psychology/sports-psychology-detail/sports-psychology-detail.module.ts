import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SportsPsychologyDetailPage } from './sports-psychology-detail.page';

import { SportsPsychologyDetailPageRoutingModule } from './sports-psychology-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SportsPsychologyDetailPageRoutingModule,
  ],
  declarations: [SportsPsychologyDetailPage],
})
export class SportsPsychologyDetailPageModule {}
