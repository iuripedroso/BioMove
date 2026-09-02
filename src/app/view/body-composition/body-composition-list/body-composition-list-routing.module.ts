import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyCompositionListPage } from './body-composition-list.page';

const routes: Routes = [
  {
    path: '',
    component: BodyCompositionListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BodyCompositionListPageRoutingModule {}
