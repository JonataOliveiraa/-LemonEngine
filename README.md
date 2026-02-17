<div align="center">
  <img src="assets/logo.png" alt="LemonEngine Logo" width="200"/>
  <h1>LemonEngine</h1>
  <p><strong>O Estúdio de Desenvolvimento Definitivo para Mods de Terraria Mobile (TL Pro).</strong></p>
</div>

---

## Sobre o Projeto

O **LemonEngine** é uma IDE moderna baseada na web, projetada para simplificar, acelerar e democratizar a criação de mods para o **Terraria** em dispositivos móveis, especificamente utilizando o carregador **TL Pro**.

Criar mods manualmente envolve gerenciar dezenas de arquivos `.js`, estruturas de pastas complexas e códigos repetitivos (boilerplate). O LemonEngine elimina essa complexidade oferecendo uma interface visual intuitiva que gerencia todo o ciclo de vida do desenvolvimento, desde a criação de arquivos até a compilação final.

### Para quem é esta ferramenta?
* **Modders iniciantes:** Crie seu primeiro item sem configurar ambientes complexos.
* **Modders experientes:** Acelere o fluxo de trabalho e evite tarefas repetitivas.
* **Equipes de desenvolvimento:** Gerencie assets e código de forma colaborativa.

---

## ✨ Principais Funcionalidades

### Gestão de Workspaces
Trabalhe em múltiplos projetos simultaneamente.
* **Dashboard Moderno:** Gerencie seus mods, crie novos ou importe arquivos `.zip` existentes.
* **Importação Inteligente:** O sistema analisa a estrutura de pastas, `Settings.json` e recria entidades automaticamente.
* **Persistência Local:** Todos os dados são salvos automaticamente no IndexedDB do navegador.

### Editor de Código Avançado
Baseado no **CodeMirror 6**, otimizado para JavaScript e API do TL Pro.
* **Autocomplete Inteligente:** Sugestões de classes, métodos e propriedades do TL Pro.
* **Snippets:** Modelos rápidos para `SetDefaults`, `OnHitNPC`, etc.
* **Linting:** Validação de sintaxe em tempo real.
* **Navegação:** Suporte a atalhos de teclado e navegação W/S para mobile.

### Gerenciador de Texturas (Texture Atlas)
Organize sprites visualmente sem lidar com caminhos de arquivo manualmente.
* **Path-Aware:** Cria automaticamente a estrutura de pastas baseada no caminho da textura.
* **Visualização:** Grade com suporte a zoom e fundo para transparência.
* **Detalhes:** Informações sobre dimensões, tamanho e vínculos de entidade.

### Sistema de Criação Rápida (Templates)
Gere entidades complexas com poucos cliques.
* **Categorias:** Itens, NPCs, Projéteis, Buffs, Biomas, etc.
* **Templates Prontos:** Espadas, Armas de Fogo, Bosses, Minions e muito mais.
* **Quick Create:** Modo para criar arquivos vazios rapidamente.

### Build System Robusto
Compile seu mod com um clique.
1.  Coleta todas as entidades e texturas.
2.  Gera arquivos de registro (`RegisterItems.js`, etc.) automaticamente.
3.  Injeta o framework TL (biblioteca core).
4.  Empacota tudo em um `.zip` pronto para a pasta `Mods` do TL Pro.

---

## 🏗️ Arquitetura do Projeto

O LemonEngine é uma SPA (Single Page Application) construída com **React 19** e **Vite**.

### Estrutura de Pastas
```text
src/
├── components/
│   ├── editor/           # Core do editor (Abas, CodeMirror, Sidebar)
│   ├── modals/           # Modais globais (Criação, Configurações)
│   └── workspace/        # Dashboard
├── store/                # Zustand stores (Gerenciamento de Estado)
├── services/             # Lógica de Build e Linguagem
├── constants/            # Templates e Configurações
└── types/                # Definições TypeScript
```

### Tecnologias Utilizadas
1. Core: React 19, TypeScript, Vite.
2. Estilização: Tailwind CSS, Lucide React (ícones).
3. Estado: Zustand (com persistência no IndexedDB).
4. Editor: CodeMirror 6.
5. JSZip: geração de arquivos no navegador.
6. UUID, Sonner: notificações.

###🚀 Instalação e Execução Local (a aplicação também é acessível pelo site oficial!)
Para rodar o LemonEngine offline ou contribuir com o desenvolvimento:

### Pré-requisitos
- Node.js (v18+)
- `npm ou yarn`

### Passos

***Clone o repositório:***
1. `git clone https://github.com/JonataOliveiraa/-LemonEngine`
2. `cd lemon-engine`
3. E então instale as dependências: `npm install`

### Execute o servidor de desenvolvimento:

`npm run dev`

***Acesse em http://localhost:5173.***

Build para produção:
`npm run build`

-------------------------------

### Contribuição
- Contribuições são bem-vindas!
- Reporte bugs: Abra uma issue descrevendo o problema
- Pull Requests: Garanta que o código siga o estilo do projeto (ESLint + Prettier).

### Licença e Créditos
- Desenvolvido usando o ExMod criado pelo Lemon Studio.
- Distribuído sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

***Discord:*** https://discord.gg/J2xFF4cDk9