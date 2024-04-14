# BETCOIN

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
git add dist -f  
git commit -m "committing dist version now"  
git subtree push --prefix dist origin gh-pages
```

### Install the Tailwind CSS v4 alpha and the new Vite plugin:
``` sh
npm install tailwindcss@next @tailwindcss/vite@next
```

### Then add the plugin to the vite.config.ts file:
``` sh
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### Finally, import Tailwind in the main CSS file:
``` sh
@import "tailwindcss";
```