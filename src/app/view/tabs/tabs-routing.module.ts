import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { authGuard } from 'src/app/guards/auth.guard';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'perfil',
        loadChildren: () =>
          import('../perfil/perfil.module').then((m) => m.PerfilPageModule),
      },
      {
        path: 'testes',
        loadChildren: () =>
          import('../tests-hub/tests-hub.module').then(
            (m) => m.TestsHubPageModule
          ),
      },
      {
        path: 'testes/endurance',
        loadChildren: () =>
          import('../endurance/endurance-list/endurance-list.module').then(
            (m) => m.EnduranceListPageModule
          ),
      },
      {
        path: 'testes/endurance/:id',
        loadChildren: () =>
          import('../endurance/endurance-detail/endurance-detail.module').then(
            (m) => m.EnduranceDetailPageModule
          ),
      },
      {
        path: 'testes/agility',
        loadChildren: () =>
          import('../agility/agility-list/agility-list.module').then(
            (m) => m.AgilityListPageModule
          ),
      },
      {
        path: 'testes/agility/:id',
        loadChildren: () =>
          import('../agility/agility-detail/agility-detail.module').then(
            (m) => m.AgilityDetailPageModule
          ),
      },
      {
        path: 'testes/mobility',
        loadChildren: () =>
          import('../mobility/mobility-list/mobility-list.module').then(
            (m) => m.MobilityListPageModule
          ),
      },
      {
        path: 'testes/mobility/:id',
        loadChildren: () =>
          import('../mobility/mobility-detail/mobility-detail.module').then(
            (m) => m.MobilityDetailPageModule
          ),
      },
      {
        path: 'testes/body-composition',
        loadChildren: () =>
          import('../body-composition/body-composition-list/body-composition-list.module').then(
            (m) => m.BodyCompositionListPageModule
          ),
      },
      {
        path: 'testes/body-composition/:id',
        loadChildren: () =>
          import('../body-composition/body-composition-detail/body-composition-detail.module').then(
            (m) => m.BodyCompositionDetailPageModule
          ),
      },
      {
        path: 'testes/strength',
        loadChildren: () =>
          import('../strength/strength-list/strength-list.module').then(
            (m) => m.StrengthListPageModule
          ),
      },
      {
        path: 'testes/strength/:id',
        loadChildren: () =>
          import('../strength/strength-detail/strength-detail.module').then(
            (m) => m.StrengthDetailPageModule
          ),
      },
      {
        path: 'testes/speed-power',
        loadChildren: () =>
          import('../speed-power/speed-power-list/speed-power-list.module').then(
            (m) => m.SpeedPowerListPageModule
          ),
      },
      {
        path: 'testes/speed-power/:id',
        loadChildren: () =>
          import('../speed-power/speed-power-detail/speed-power-detail.module').then(
            (m) => m.SpeedPowerDetailPageModule
          ),
      },
      {
        path: 'testes/sports-psychology',
        loadChildren: () =>
          import('../sports-psychology/sports-psychology-list/sports-psychology-list.module').then(
            (m) => m.SportsPsychologyListPageModule
          ),
      },
      {
        path: 'testes/sports-psychology/:id',
        loadChildren: () =>
          import('../sports-psychology/sports-psychology-detail/sports-psychology-detail.module').then(
            (m) => m.SportsPsychologyDetailPageModule
          ),
      },
      {
        path: 'testes/general-health',
        loadChildren: () =>
          import('../general-health/general-health-list/general-health-list.module').then(
            (m) => m.GeneralHealthListPageModule
          ),
      },
      {
        path: 'testes/general-health/:id',
        loadChildren: () =>
          import('../general-health/general-health-detail/general-health-detail.module').then(
            (m) => m.GeneralHealthDetailPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
