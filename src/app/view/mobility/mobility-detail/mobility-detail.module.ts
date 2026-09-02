import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MobilityDetailPage } from './mobility-detail.page';

import { MobilityDetailPageRoutingModule } from './mobility-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MobilityDetailPageRoutingModule,
  ],
  declarations: [MobilityDetailPage],
})
export class MobilityDetailPageModule {}
