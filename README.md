# LoginApp

App Ionic + Angular contendo apenas a tela de **login/cadastro**, extraída e adaptada do projeto VoleiApp.

## O que tem aqui
- Tela de Login (`sign-in`) com email/senha e botão "Entrar com Google"
- Tela de Cadastro (`sign-up`)
- Tela inicial simples pós-login (`home`)
- `AuthService` **mockado** (sem nenhum banco de dados/Firebase) — os usuários ficam salvos em `localStorage` só para fins de demonstração

## Rodando o projeto
```bash
npm install
ionic serve
```

## Próximos passos
Para conectar a um banco de dados real, basta reimplementar os métodos de `src/app/model/service/auth.service.ts` (mantendo as mesmas assinaturas) chamando sua API/backend.
