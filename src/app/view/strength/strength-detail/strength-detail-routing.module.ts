import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StrengthDetailPage } from './strength-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StrengthDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StrengthDetailPageRoutingModule {}
