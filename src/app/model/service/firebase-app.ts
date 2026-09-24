import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

/**
 * Inicialização única do Firebase para o app inteiro.
 *
 * Não usamos o pacote @angular/fire aqui de propósito: o SDK modular puro
 * (pacote "firebase") evita problemas de compatibilidade de versão com o
 * Angular 17/Ionic 7 e mantém o bundle menor. `auth` e `db` são importados
 * diretamente pelos serviços que precisam deles (AuthService,
 * RecentTestsService), como um singleton comum de módulo ES.
 */
const firebaseApp = initializeApp(environment.firebase);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
