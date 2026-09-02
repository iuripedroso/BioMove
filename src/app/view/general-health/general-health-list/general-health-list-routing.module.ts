import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralHealthListPage } from './general-health-list.page';

const routes: Routes = [
  {
    path: '',
    component: GeneralHealthListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralHealthListPageRoutingModule {}
