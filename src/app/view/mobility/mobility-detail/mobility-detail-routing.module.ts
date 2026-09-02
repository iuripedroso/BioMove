import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobilityDetailPage } from './mobility-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MobilityDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobilityDetailPageRoutingModule {}
