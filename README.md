# ACC Hymns

Central ACC Hymnal for many song books used across the ACC

## Using ACC Hymns
| Android | iOS | Web |
|:-:|:-:|:-:|
| [<img src="/public/assets/en_badge_web_generic.png" height="75"/>](https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns) | [<img src="/public/assets/Appstore_badge.svg" height="50"/>](https://apps.apple.com/us/app/acc-hymns/id1634426405) | [acchymns.app](https://www.acchymns.app) |
## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
npm run preview # To preview the minified website
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Workflow for developing IOS/Android

```sh
npm run dev # Until happy with changes
npm run build # Build & minify all changes
npx cap sync # Sync all web changes to native apps

# Open in native app editor
npx cap open ios # XCode
npx cap open android # Android Studio

# Run emulator (these commands will sync+build&run)
npx cap run ios
npx cap run android
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Developers

- Christopher Weinhardt
- Timothy Weinhardt
- Dallas Hart
- Sis. Ruth Oldja

## Special Thanks

Thanks for supplying PDFs, scans, advice, or assistance.

- Bro. Ceda Bekic
- Bro. Peter Denzinger
- Sis. Rosina Stefan
- Seby Nitz
- Joey Nitz
- Susie Nitz
- Neven Jokic
- Alyssa Nenadov
- Riley Nenadov
- Joel Walter
- Leah Walter
