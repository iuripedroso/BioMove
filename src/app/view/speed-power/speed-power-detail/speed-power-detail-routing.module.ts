import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeedPowerDetailPage } from './speed-power-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SpeedPowerDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpeedPowerDetailPageRoutingModule {}
