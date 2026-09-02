import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AgilityDetailPage } from './agility-detail.page';

import { AgilityDetailPageRoutingModule } from './agility-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AgilityDetailPageRoutingModule,
  ],
  declarations: [AgilityDetailPage],
})
export class AgilityDetailPageModule {}
