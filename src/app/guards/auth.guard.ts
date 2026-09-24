import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../model/service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera o Firebase confirmar (na inicialização do app) se já existe uma
  // sessão ativa antes de decidir — sem isso, um F5 na página sempre
  // mandaria o usuário de volta pro login, mesmo já logado.
  await authService.authReady();

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/sign-in']);
  return false;
};
