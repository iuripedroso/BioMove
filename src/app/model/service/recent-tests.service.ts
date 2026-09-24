import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase-app';
import { AuthService } from './auth.service';

/** Entrada de teste visitado recentemente, usada nos atalhos da home. */
export interface RecentTest {
  /** slug da categoria (rota), ex: 'strength' */
  categoryId: string;
  /** slug do teste (rota), ex: 'bench-press' */
  testId: string;
  /** código do teste no livro, ex: '5.14' */
  code: string;
  /** nome exibido no chip */
  name: string;
  /** timestamp de quando foi aberto */
  when: number;
}

const MAX_ENTRIES = 5;

/**
 * Guarda no Firestore (subcoleção `users/{uid}/recentTests`) os últimos
 * testes abertos pelo usuário logado, para a home oferecer o atalho
 * "continuar de onde parou". Antes ficava no localStorage do navegador;
 * agora fica associado à conta, então acompanha o usuário em qualquer
 * dispositivo.
 */
@Injectable({
  providedIn: 'root',
})
export class RecentTestsService {
  constructor(private authService: AuthService) {}

  /** Registra a abertura de um teste (deduplica por categoria+teste, mantém no máx. 5). */
  async record(entry: Omit<RecentTest, 'when'>): Promise<void> {
    const usuario = this.authService.getUserLogged();
    if (!usuario) {
      return;
    }

    const docId = `${entry.categoryId}_${entry.testId}`;
    const ref = doc(db, 'users', usuario.uid, 'recentTests', docId);

    await setDoc(ref, {
      ...entry,
      when: serverTimestamp(),
    });
  }

  /** Últimos testes abertos, do mais recente para o mais antigo. */
  async list(): Promise<RecentTest[]> {
    const usuario = this.authService.getUserLogged();
    if (!usuario) {
      return [];
    }

    try {
      const recentesRef = collection(db, 'users', usuario.uid, 'recentTests');
      const q = query(recentesRef, orderBy('when', 'desc'), limit(MAX_ENTRIES));
      const snap = await getDocs(q);

      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          categoryId: data.categoryId,
          testId: data.testId,
          code: data.code,
          name: data.name,
          when: data.when?.toMillis?.() ?? Date.now(),
        } as RecentTest;
      });
    } catch {
      return [];
    }
  }
}
