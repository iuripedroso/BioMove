import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralHealthDetailPage } from './general-health-detail.page';

const routes: Routes = [
  {
    path: '',
    component: GeneralHealthDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralHealthDetailPageRoutingModule {}
