import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyCompositionDetailPage } from './body-composition-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BodyCompositionDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BodyCompositionDetailPageRoutingModule {}
