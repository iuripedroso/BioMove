import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SportsPsychologyListPage } from './sports-psychology-list.page';

const routes: Routes = [
  {
    path: '',
    component: SportsPsychologyListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SportsPsychologyListPageRoutingModule {}
