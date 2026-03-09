<div align="center">
  <img src="public/assets/logo.png" alt="LemonEngine Logo" width="180"/>
  <h1>LemonEngine</h1>
  <p><strong>The definitive development studio for Terraria Mobile mods (TL Pro).</strong></p>

  <p>
    <a href="https://github.com/JonataOliveiraa/-LemonEngine/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-LemonEngine%20NCL-yellow.svg" alt="License"/></a>
    <a href="https://discord.gg/J2xFF4cDk9"><img src="https://img.shields.io/discord/J2xFF4cDk9?logo=discord&label=Discord&color=5865F2" alt="Discord"/></a>
    <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19"/>
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Vite-6-646cff?logo=vite" alt="Vite"/>
  </p>
</div>

---

## Overview

**LemonEngine** is a modern, browser-based IDE designed to simplify and accelerate mod development for **Terraria** on mobile devices, specifically targeting the **TL Pro** mod loader.

Creating mods manually means juggling dozens of `.js` files, complex folder hierarchies, and endless boilerplate code. LemonEngine removes that friction entirely — offering a visual, intuitive interface that manages the full development lifecycle, from entity creation to final build output.

---

## Who Is This For?

| User | How LemonEngine Helps |
|---|---|
| **Beginner modders** | Create your first item without touching config files or folder structures |
| **Experienced modders** | Skip the boilerplate and focus on logic and creativity |
| **Dev teams** | Manage assets, code, and entities collaboratively in one place |

---

## Features

### Workspace Management
- **Modern Dashboard** — Create, manage, and switch between multiple mod projects
- **Smart Import** — Paste in an existing `.zip` mod; LemonEngine analyzes the folder structure, reads `Settings.json`, and reconstructs all entities automatically
- **Local Persistence** — Everything is saved automatically to the browser's IndexedDB — no account or server required

### Advanced Code Editor
Powered by **CodeMirror 6**, tuned for JavaScript and the TL Pro API.
- **Intelligent Autocomplete** — Suggestions for TL Pro classes, methods, and properties
- **Snippets** — Pre-built templates for `SetDefaults`, `OnHitNPC`, and more
- **Real-Time Linting** — Syntax errors flagged as you type
- **Mobile-Ready** — Keyboard shortcuts and W/S navigation optimized for touchscreens

### Texture Manager
Organize sprites visually without touching file paths.
- **Path-Aware** — Automatically generates the correct folder structure from texture paths
- **Visual Grid** — Zoom support and transparency grid for accurate previewing
- **Entity Linking** — View texture dimensions, file size, and which entities reference each asset

### Quick Create System (Templates)
Generate fully structured entities in seconds.
- **Entity Types** — Items, NPCs, Projectiles, Buffs, Biomes, and more
- **Ready-Made Templates** — Swords, Guns, Bosses, Minions, Town NPCs, and beyond
- **Quick Blank Mode** — Instantly scaffold empty files when you just need a starting point

### Build System
One-click compilation to a ready-to-deploy mod package.
1. Collects all entities, hooks, and textures
2. Auto-generates registration files (`RegisterItems.js`, etc.)
3. Injects the TL framework core library
4. Packages everything into a `.zip` ready to drop into TL Pro's `Mods` folder

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Core** | React 19, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS, Lucide React |
| **State** | Zustand (with IndexedDB persistence) |
| **Editor** | CodeMirror 6 |
| **Build Output** | JSZip |
| **Notifications** | Sonner |
| **Utilities** | UUID |

---

## Project Structure

```
src/
├── components/
│   ├── editor/           # Editor core (tabs, CodeMirror, sidebar)
│   ├── modals/           # Global modals (entity creation, settings)
│   └── workspace/        # Dashboard and project management
├── store/                # Zustand state stores
├── services/             # Build system and language services
├── constants/            # Templates and configuration constants
└── types/                # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- Node.js **v18** or higher
- `npm` or `yarn`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JonataOliveiraa/-LemonEngine
cd lemon-engine

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

> The app is also accessible online at the official site — no installation required.

---

## Contributing

Contributions are welcome and appreciated.

- **Bug reports** — Open an issue with a clear description and reproduction steps
- **Feature requests** — Start a discussion before opening a PR
- **Pull requests** — Ensure your code follows the project's ESLint + Prettier configuration

---

## License

LemonEngine is distributed under the **LemonEngine Non-Commercial License (NCL)**.  
Free to use, copy, and modify — **commercial sale of this software or derivatives is not permitted.**

See the [LICENSE](./LICENSE) file for full terms.

---

## Credits

Built on top of **ExMod**, created by **Lemon Studio**.

**Discord:** [discord.gg/J2xFF4cDk9](https://discord.gg/J2xFF4cDk9)
