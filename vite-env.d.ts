// vite-env.d.ts

// Essa diretiva especial diz ao compilador do TypeScript para usar 
// os tipos globais fornecidos pelo Vite. Com isso, o erro de 
// "Cannot find module './assets/icon.png'" vai sumir do seu editor.
/// <reference types="vite/client" />