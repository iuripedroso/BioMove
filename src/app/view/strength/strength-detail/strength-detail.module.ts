import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StrengthDetailPage } from './strength-detail.page';

import { StrengthDetailPageRoutingModule } from './strength-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StrengthDetailPageRoutingModule,
  ],
  declarations: [StrengthDetailPage],
})
export class StrengthDetailPageModule {}
