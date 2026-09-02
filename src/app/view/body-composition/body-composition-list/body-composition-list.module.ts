import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BodyCompositionListPage } from './body-composition-list.page';

import { BodyCompositionListPageRoutingModule } from './body-composition-list-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, BodyCompositionListPageRoutingModule],
  declarations: [BodyCompositionListPage],
})
export class BodyCompositionListPageModule {}
