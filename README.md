# ACC Hymns

Central ACC Hymnal for many song books used across the ACC

## Using ACC Hymns
| Android | iOS | Web |
|:-:|:-:|:-:|
| [<img src="/public/assets/en_badge_web_generic.png" height="75"/>](https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns) | [<img src="/public/assets/Appstore_badge.svg" height="50"/>](https://apps.apple.com/us/app/acc-hymns/id1634426405) | [acchymns.app](https://www.acchymns.app) |

## Hymnal Progress
A table showing the development and implemented features for each hymnal:
[Spreadsheet](https://docs.google.com/spreadsheets/d/1Wwl8wrOgCiCpcy21894W961yvckVhz6XwVcfSmaGW_E/edit?usp=sharing)

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

[VSCode](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Style Guide

```ts
const snake_case: string = "Lorem ipsum";
type PascalCase = {
    snake_case: string;
};
function doSomething(snake_case: PascalCase): void {
    console.log(snake_case.snake_case);
}
```

## Developers

- Bro. Christopher Weinhardt
- Timothy Weinhardt
- Dallas Hart
- Sis. Ruth Oldja

## Special Thanks

Thanks for supplying PDFs, scans, advice, or assistance.

- Bro. Ceda Bekic
- Bro. Peter Denzinger
- Bro. Zoltan Dobosi
- Sis. Rosina Stefan
- Bro. Seby Nitz
- Elias Prohaszka
- Joey Nitz
- Susan Nitz
- Neven Jokic
- Alyssa Nenadov
- Riley Nenadov
- Joel Walter
- Leah Walter
