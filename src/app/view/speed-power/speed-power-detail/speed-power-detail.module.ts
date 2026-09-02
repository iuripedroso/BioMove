import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SpeedPowerDetailPage } from './speed-power-detail.page';

import { SpeedPowerDetailPageRoutingModule } from './speed-power-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SpeedPowerDetailPageRoutingModule,
  ],
  declarations: [SpeedPowerDetailPage],
})
export class SpeedPowerDetailPageModule {}
