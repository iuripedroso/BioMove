import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadChildren: () =>
      import('./view/usuarios/sign-in/sign-in.module').then(
        (m) => m.SignInPageModule
      ),
  },
  {
    path: 'sign-up',
    loadChildren: () =>
      import('./view/usuarios/sign-up/sign-up.module').then(
        (m) => m.SignUpPageModule
      ),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./view/tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
