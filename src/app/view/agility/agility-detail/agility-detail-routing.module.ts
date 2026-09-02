import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgilityDetailPage } from './agility-detail.page';

const routes: Routes = [
  {
    path: '',
    component: AgilityDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgilityDetailPageRoutingModule {}
