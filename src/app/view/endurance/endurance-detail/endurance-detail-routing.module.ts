import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnduranceDetailPage } from './endurance-detail.page';

const routes: Routes = [
  {
    path: '',
    component: EnduranceDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnduranceDetailPageRoutingModule {}
