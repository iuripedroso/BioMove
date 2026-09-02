import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StrengthListPage } from './strength-list.page';

const routes: Routes = [
  {
    path: '',
    component: StrengthListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StrengthListPageRoutingModule {}
