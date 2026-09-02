import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BodyCompositionDetailPage } from './body-composition-detail.page';

import { BodyCompositionDetailPageRoutingModule } from './body-composition-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BodyCompositionDetailPageRoutingModule,
  ],
  declarations: [BodyCompositionDetailPage],
})
export class BodyCompositionDetailPageModule {}
