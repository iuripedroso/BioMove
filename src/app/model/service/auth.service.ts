import { Injectable } from '@angular/core';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase-app';

/**
 * Serviço de autenticação com Firebase (Authentication + Firestore).
 *
 * Mantém a mesma assinatura pública do AuthService mockado anterior
 * (signIn, signUpWithEmailPassword, recoverPassword, signOut,
 * getUserLogged, updateProfile, isLoggedIn, signInWithGoogle), para não
 * exigir mudanças nas telas que já o consomem (sign-in, sign-up, perfil,
 * home, guard) — só a implementação por trás mudou.
 *
 * Dados de autenticação (email/senha, uid) ficam no Firebase Authentication.
 * Dados de perfil (nome, instituição, idade, sexo, altura, peso) ficam no
 * Firestore, no documento `users/{uid}`.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Cache em memória do usuário logado (auth + perfil do Firestore), para leitura síncrona. */
  private usuarioAtual: any = null;

  /** Resolve assim que o Firebase informa (pela 1ª vez) se há alguém logado. */
  private readonly prontoPromise: Promise<void>;

  constructor() {
    this.prontoPromise = new Promise((resolve) => {
      let primeiraChamada = true;

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          this.usuarioAtual = await this.montarUsuario(firebaseUser);
        } else {
          this.usuarioAtual = null;
        }

        if (primeiraChamada) {
          primeiraChamada = false;
          resolve();
        }
      });
    });
  }

  /** Usado pelo guard: espera o Firebase resolver (na inicialização) se há sessão ativa. */
  public authReady(): Promise<void> {
    return this.prontoPromise;
  }

  public signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (credencial) => {
        this.usuarioAtual = await this.montarUsuario(credencial.user);
        return { user: this.usuarioAtual };
      })
      .catch((error) => {
        throw { message: this.traduzErro(error?.code) };
      });
  }

  public signUpWithEmailPassword(
    email: string,
    password: string,
    perfilExtra?: { nome?: string; instituicao?: string }
  ): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (credencial) => {
        const perfil = {
          email,
          nome: perfilExtra?.nome ?? '',
          instituicao: perfilExtra?.instituicao ?? '',
          criadoEm: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', credencial.user.uid), perfil);
        this.usuarioAtual = { uid: credencial.user.uid, ...perfil };
        return { user: this.usuarioAtual };
      })
      .catch((error) => {
        throw { message: this.traduzErro(error?.code) };
      });
  }

  public recoverPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email).catch((error) => {
      throw { message: this.traduzErro(error?.code) };
    });
  }

  public signOut(): Promise<void> {
    return firebaseSignOut(auth).then(() => {
      this.usuarioAtual = null;
    });
  }

  /** Leitura síncrona do usuário logado (auth + perfil), a partir do cache em memória. */
  public getUserLogged(): any | null {
    return this.usuarioAtual;
  }

  public updateProfile(dadosAtualizados: any): Promise<any> {
    const usuarioAtual = this.getUserLogged();
    if (!usuarioAtual) {
      return Promise.resolve(null);
    }

    return setDoc(doc(db, 'users', usuarioAtual.uid), dadosAtualizados, {
      merge: true,
    }).then(() => {
      this.usuarioAtual = { ...usuarioAtual, ...dadosAtualizados };
      return this.usuarioAtual;
    });
  }

  public isLoggedIn(): boolean {
    return this.usuarioAtual !== null;
  }

  public signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (credencial) => {
        this.usuarioAtual = await this.montarUsuario(credencial.user, true);
        return { user: this.usuarioAtual };
      })
      .catch((error) => {
        throw { message: this.traduzErro(error?.code) };
      });
  }

  /**
   * Junta os dados do Firebase Authentication com o documento de perfil do
   * Firestore (`users/{uid}`). Se o documento ainda não existir (1º login,
   * ex: via Google), cria com os dados básicos disponíveis.
   */
  private async montarUsuario(
    firebaseUser: FirebaseUser,
    criarSeNaoExistir = false
  ): Promise<any> {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { uid: firebaseUser.uid, email: firebaseUser.email, ...snap.data() };
    }

    const perfilBasico = {
      email: firebaseUser.email ?? '',
      nome: firebaseUser.displayName ?? '',
      instituicao: '',
      criadoEm: serverTimestamp(),
    };

    if (criarSeNaoExistir) {
      await setDoc(ref, perfilBasico);
    }

    return { uid: firebaseUser.uid, ...perfilBasico };
  }

  private traduzErro(codigo?: string): string {
    switch (codigo) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Senha incorreta.';
      case 'auth/email-already-in-use':
        return 'Este email já está cadastrado.';
      case 'auth/weak-password':
        return 'A senha precisa ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/popup-closed-by-user':
        return 'Login com Google cancelado.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  }
}
