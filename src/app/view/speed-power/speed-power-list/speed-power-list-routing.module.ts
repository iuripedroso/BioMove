import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeedPowerListPage } from './speed-power-list.page';

const routes: Routes = [
  {
    path: '',
    component: SpeedPowerListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpeedPowerListPageRoutingModule {}
