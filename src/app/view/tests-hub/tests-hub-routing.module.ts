import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestsHubPage } from './tests-hub.page';

const routes: Routes = [
  {
    path: '',
    component: TestsHubPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestsHubPageRoutingModule {}
