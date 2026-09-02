import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgilityListPage } from './agility-list.page';

const routes: Routes = [
  {
    path: '',
    component: AgilityListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgilityListPageRoutingModule {}
