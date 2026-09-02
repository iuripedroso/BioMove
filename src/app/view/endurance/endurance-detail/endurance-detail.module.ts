import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EnduranceDetailPage } from './endurance-detail.page';

import { EnduranceDetailPageRoutingModule } from './endurance-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EnduranceDetailPageRoutingModule,
  ],
  declarations: [EnduranceDetailPage],
})
export class EnduranceDetailPageModule {}
