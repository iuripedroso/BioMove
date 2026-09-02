import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Serviço de autenticação MOCKADO.
 * Mantém a mesma assinatura/comportamento do AuthService original do VoleiApp,
 * porém sem nenhuma dependência de banco de dados (Firebase ou outro).
 *
 * Os usuários são guardados apenas em localStorage. Quando você tiver seu
 * próprio backend, basta trocar a implementação dos métodos abaixo.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  usuarioDados: any;

  constructor(private router: Router) {
    const user = localStorage.getItem('user');
    this.usuarioDados = user ? JSON.parse(user) : null;
  }

  public signIn(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usuarios = this.getUsuariosCadastrados();
        const usuario = usuarios.find((u: any) => u.email === email);

        if (!usuario) {
          reject({ message: 'Usuário não encontrado.' });
          return;
        }

        if (usuario.senha !== password) {
          reject({ message: 'Senha incorreta.' });
          return;
        }

        this.usuarioDados = usuario;
        localStorage.setItem('user', JSON.stringify(usuario));
        resolve({ user: usuario });
      }, 500);
    });
  }

  public signUpWithEmailPassword(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usuarios = this.getUsuariosCadastrados();

        if (usuarios.some((u: any) => u.email === email)) {
          reject({ message: 'Este email já está cadastrado.' });
          return;
        }

        const novoUsuario = {
          uid: Date.now().toString(),
          email,
          senha: password,
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        resolve({ user: novoUsuario });
      }, 500);
    });
  }

  public recoverPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      console.log(`[mock] Email de recuperação enviado para ${email}`);
      resolve();
    });
  }

  public signOut(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem('user');
      this.usuarioDados = null;
      resolve();
    });
  }

  public getUserLogged(): any | null {
    const user: any = JSON.parse(localStorage.getItem('user') || 'null');
    return user ?? null;
  }

  public updateProfile(dadosAtualizados: any): Promise<any> {
    return new Promise((resolve) => {
      const usuarioAtual = this.getUserLogged();
      if (!usuarioAtual) {
        resolve(null);
        return;
      }

      const usuarioAtualizado = { ...usuarioAtual, ...dadosAtualizados };

      // Atualiza o usuário "logado"
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      this.usuarioDados = usuarioAtualizado;

      // Atualiza também na "base" de usuários cadastrados
      const usuarios = this.getUsuariosCadastrados();
      const index = usuarios.findIndex((u: any) => u.uid === usuarioAtual.uid);
      if (index !== -1) {
        usuarios[index] = usuarioAtualizado;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
      }

      resolve(usuarioAtualizado);
    });
  }

  public isLoggedIn(): boolean {
    const user: any = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
  }

  public signInWithGoogle(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usuario = {
          uid: 'google-mock-uid',
          email: 'usuario.google@exemplo.com',
          nome: 'Usuário Google',
        };
        this.usuarioDados = usuario;
        localStorage.setItem('user', JSON.stringify(usuario));
        resolve({ user: usuario });
      }, 500);
    });
  }

  private getUsuariosCadastrados(): any[] {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }
}
