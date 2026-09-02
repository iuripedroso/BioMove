import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SportsPsychologyDetailPage } from './sports-psychology-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SportsPsychologyDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SportsPsychologyDetailPageRoutingModule {}
