import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GeneralHealthDetailPage } from './general-health-detail.page';

import { GeneralHealthDetailPageRoutingModule } from './general-health-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GeneralHealthDetailPageRoutingModule,
  ],
  declarations: [GeneralHealthDetailPage],
})
export class GeneralHealthDetailPageModule {}
