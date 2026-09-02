import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnduranceListPage } from './endurance-list.page';

const routes: Routes = [
  {
    path: '',
    component: EnduranceListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnduranceListPageRoutingModule {}
