import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../model/service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Usuário está logado, permite acesso à rota
  } else {
    // Opcional: você pode salvar a URL pretendida para redirecionar o usuário após o login
    // authService.redirectUrl = state.url;

    router.navigate(['/sign-in']); // Redireciona para a página de login
    return false; // Usuário não está logado, bloqueia acesso à rota
  }
};
