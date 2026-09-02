import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SpeedPowerListPage } from './speed-power-list.page';

import { SpeedPowerListPageRoutingModule } from './speed-power-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, SpeedPowerListPageRoutingModule],
  declarations: [SpeedPowerListPage],
})
export class SpeedPowerListPageModule {}
