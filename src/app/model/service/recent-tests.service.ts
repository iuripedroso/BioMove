import { Injectable } from '@angular/core';

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

const STORAGE_KEY = 'recent-tests';
const MAX_ENTRIES = 5;

/**
 * Guarda no localStorage os últimos testes abertos pelo usuário, para a
 * home oferecer o atalho "continuar de onde parou".
 */
@Injectable({
  providedIn: 'root',
})
export class RecentTestsService {
  /** Registra a abertura de um teste (deduplica e mantém no máximo 5). */
  record(entry: Omit<RecentTest, 'when'>): void {
    const list = this.list().filter(
      (r) => !(r.categoryId === entry.categoryId && r.testId === entry.testId)
    );
    list.unshift({ ...entry, when: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  }

  /** Últimos testes abertos, do mais recente para o mais antigo. */
  list(): RecentTest[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
