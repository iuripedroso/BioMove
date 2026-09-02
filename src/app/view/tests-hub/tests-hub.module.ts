import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestsHubPage } from './tests-hub.page';

import { TestsHubPageRoutingModule } from './tests-hub-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, SharedModule, TestsHubPageRoutingModule],
  declarations: [TestsHubPage],
})
export class TestsHubPageModule {}
