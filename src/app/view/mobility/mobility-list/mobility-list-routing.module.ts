import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobilityListPage } from './mobility-list.page';

const routes: Routes = [
  {
    path: '',
    component: MobilityListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobilityListPageRoutingModule {}
