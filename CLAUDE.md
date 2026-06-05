# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ioBroker adapter that lets users configure interactive Telegram menus via a React admin UI. The adapter acts as a bridge: it subscribes to Telegram instance states in ioBroker, interprets user button presses, and dispatches actions (set/get ioBroker states, send pictures, HTTP requests, ECharts, location, shopping lists).

## Commands

```bash
# Full build (runs lint:fix, then React, then TypeScript)
npm run build

# Build individually
npm run build:react        # frontend only
npm run tsc                # backend TypeScript only

# Development
npm run watch:react        # frontend watch mode
npm run dev                # dev-server (ioBroker dev environment)

# Testing
npm run test               # unit tests + package tests
npm run test:js            # unit tests only (mocha + ts-node)
npm run test:watch         # unit tests in watch mode
npm run test:cov           # unit tests with HTML coverage report (nyc)

# Run a single test file
npx mocha -r ts-node/register -r tsconfig-paths/register "test/test/app/telegram.test.ts" --config test/mocharc.custom.json

# Linting
npm run lint               # lint backend + frontend
npm run lint:fix           # auto-fix lint issues (both)
npm run lint:backend       # backend only
npm run lint:frontend      # frontend (admin/src/) only

# Translation
npm run translate          # generate i18n translations via translate-adapter
```

## Architecture

The project has two distinct parts with separate build pipelines that share TypeScript path aliases.

### Path Aliases (tsconfig.json)

| Alias | Resolves to |
|---|---|
| `@backend/*` | `src/*` |
| `@/*` | `admin/src/*` |
| `@components/*` | `admin/src/components/*` |

### Backend (`src/`)

**Entry point**: `src/main.ts` — extends `utils.Adapter` from `@iobroker/adapter-core`. Lifecycle:
1. `onReady`: reads config, checks Telegram connections, builds `menuData` structure, subscribes to Telegram states
2. `stateChange`: routes incoming Telegram requests through the menu processing pipeline
3. `onUnload`: clears timeouts

**Data flow at startup**:
```
adapter.config → getConfigVariables()
              → splitNavigation()   (raw config rows → splittedNavigation[])
              → getNewStructure()   (splittedNavigation → NewObjectStructure per menu)
              → generateActions()   (merges action config into the structure)
              → menuData: MenuData  (Record<menuName, NewObjectStructure>)
```

**Request handling** (stateChange):
```
Telegram state change → checkEveryMenuForData() → processData()
  → dynamicValue pending?  → setstateIobroker + switchBack
  → part.nav?              → sendNav() or callSubMenu()
  → part.switch?           → handleSetState()
  → part.getData?          → getState()
  → part.sendPic?          → sendPic()
  → part.location?         → sendLocationToTelegram()
  → part.echarts?          → getChart()
  → part.httpRequest?      → httpRequest()
```

**Key modules**:
- `src/app/configVariables.ts` — parses `adapter.config` into typed variables; also defines `getIds` (Telegram state ID constructors)
- `src/app/processData.ts` — central dispatcher that routes a user's button press to the right action
- `src/app/action.ts` — `generateActions()` merges set/get/pic/echarts/httpRequest/events action config into the nav object structure; `bindingFunc()` evaluates `binding:{...}` expressions
- `src/app/telegram.ts` — `sendToTelegram()` and `sendToTelegramSubmenu()` send messages/keyboards to Telegram instances via `adapter.sendTo()`
- `src/app/events.ts` — handles event-triggered navigation (state change fires a menu automatically)
- `src/app/dynamicValue.ts` — tracks per-user pending dynamic input (user must type a value next)
- `src/app/backMenu.ts` — tracks navigation history per user for back navigation
- `src/lib/appUtils.ts` — `splitNavigation`, `getNewStructure`, `getStartSides`, `getListOfMenusIncludingUser`, `mathFunction`, `roundValue`
- `src/lib/exchangeValue.ts` — `exchangeValue()` / `exchangePlaceholderWithValue()` for `{status:...}`, `change{...}`, `{set:...}` template substitution
- `src/config/config.ts` — text template pattern constants (binding, math, round, timestamp, status, json, etc.) and `arrayOfEntries` which drives `generateActions`

**Text template system** (evaluated at send-time):
- `{status:'ID':true}` / `{status:ID:true}` — current state value with optional change indicator
- `{math:val+10}` — math expression applied to a value
- `{round:2}` — round value to N decimals
- `{time}` — current time
- `{time.ts...}` / `{time.lc...}` — state timestamp/last change formatted
- `binding:{key=ID;key2=ID2;?key+key2}` — bind multiple state values then evaluate
- `change{...}` — value change indicator
- `{set:ID}` — set a state inline
- `{json...}` — JSON table formatting

**Types**: `src/types/types.ts` contains all backend types. `src/types/adapter-config.d.ts` extends ioBroker's `_AdapterConfig` with the actual config shape.

### Frontend (`admin/src/`)

React 18 + MUI v7 class components. Entry: `admin/src/index.tsx` → `App` (GenericApp subclass from `@iobroker/adapter-react-v5`).

**Component hierarchy**:
```
App (GenericApp)
└── AppContent  (admin/src/pages/AppContent.tsx)
    ├── shared/AppContentNavigation  (tab bar: Navigation / Action / Users / Trigger / etc.)
    ├── header/AppContentHeader      (menu selector + telegram user assignment)
    └── AppContentTab  (admin/src/pages/AppContentTab.tsx)
        ├── navigation/AppContentTabNavigation  (DnD table for nav rows)
        ├── action/AppContentTabAction          (DnD table for get/set/pic/echarts/httpRequest/events)
        ├── settings/AppContentTabSettings      (instance list + config checkboxes/inputs)
        └── settings/AppContentTabDescription   (description/documentation tab)
```

**Pages directory structure** (`admin/src/pages/`):
```
pages/
├── AppContent.tsx          ← top-level layout wrapper
├── AppContentTab.tsx       ← tab panel switcher
├── action/                 ← all action tab components
├── navigation/             ← all navigation tab components
├── settings/               ← settings + description tab
├── header/                 ← header bar, menu buttons, telegram users
├── overview/               ← trigger overview, double-trigger info
└── shared/                 ← dropbox, icon bar, navigation sidebar
```

**Frontend lib** (`admin/src/lib/`) — pure TypeScript, no React, directly testable:
- `settings.ts` — `shouldDefaultSendMenuAfterRestart`, `getCheckboxDisplayValue`, `getUpdatedCheckboxes`, `getUpdatedInstanceList`
- `menuUtils.ts` — `menuNameExists`, `isInvalidNewMenuName`
- `dropboxUtils.ts` — `countItemsInArray`, `isNavigationRow`
- `actionUtils.ts` — row/trigger management (large)
- `dragNDrop.ts`, `movePosition.ts`, `Utils.ts`, `string.ts`, `object.ts`, `color.ts`

**Frontend test pattern**: Frontend lib functions cannot use React/DOM. Extract to `admin/src/lib/*.ts` (no React imports), then import in tests via relative path `'../../../admin/src/lib/...'`. The `@/` alias does NOT work in test files — use relative paths instead.

**State management**: All state lives in the top-level `App` component (GenericApp pattern). Callbacks are passed down as `callback` props; `callback.setStateApp` updates App state, `callback.updateNative` persists config changes to ioBroker.

**Types**: `admin/src/types/app.d.ts` — all frontend types. `admin/src/types/props-types.d.ts` — component prop interfaces.

**Frontend TypeScript check**: Use `npx tsc -p admin/tsconfig.json --noEmit` (the root `tsc` only checks `src/` and `test/`, not the frontend).

**Frontend lib** (`admin/src/lib/`):
- `settings.ts` — pure helpers for `AppContentTabSettings`: `shouldDefaultSendMenuAfterRestart`, `getCheckboxDisplayValue`, `getUpdatedCheckboxes`, `getUpdatedInstanceList`
- `menuUtils.ts` — `menuNameExists`, `isInvalidNewMenuName`
- `dropboxUtils.ts` — `countItemsInArray`, `isNavigationRow`

### CSS Architecture (`admin/css/`)

16 CSS files, alle importiert über `admin/css/style.css`. Wichtigste Dateien:

| Datei | Inhalt |
|---|---|
| `colors.css` | Alle CSS-Variablen (Farben, zukünftig Spacing/Typography) |
| `style.css` | Haupt-Import + globale Klassen (Dialog, Dropbox, Telegram-User, Navigation-Row etc.) |
| `button.css` | Button-Varianten (`.button`, `.button__ok`, `.button__icon-table` etc.) |
| `table.css` | Tabellen-Styling (Sticky Header, Row-Farben, Hover) |
| `app-content.css` | Layout-Container (`.app__box`, `.navigation__container`, `.action__container`) |
| `tab-action.css` | Die Sub-Tab-Buttons in der Action-Ansicht |

**CSS-Variablen**: Alle Farben sind in `colors.css` als `--varname` definiert, mit Dark-Mode-Override via `.dark { }`. Spacing/Typography-Variablen sollen noch ergänzt werden (geplant: `--space-1..8`, `--text-xs..xl`, `--radius-sm/md/lg`).

**BEM-Konvention** (wird schrittweise eingeführt):
- Element: `block__element-name` (Bindestrich, NICHT Unterstrich bei mehrteiligen Namen)
- Modifier: `block--modifier` oder `block__element--modifier`
- Utilities (`.flex`, `.items-center` etc.) folgen nicht BEM
- State-Klassen: `.is-active`, `.is-disabled`

**Button-Komponente (`admin/src/components/Button.tsx`)**: Hat 13 Inline-Style-Props (`b_color`, `color`, `padding`, `width`, `height`, `fontSize`, `border`, `borderRadius`, `margin`, `maxWidth`, `verticalAlign`, `small`, `round`). CSS-Klassen via `className`-Prop können Inline-Styles nur mit `!important` überschreiben. `disableButtonStyleByComponent={true}` deaktiviert alle Inline-Styles, dann greift nur noch die CSS-Klasse.

**Tabellen-Scroll-Kette**: Damit Tabellen bei kleinem Viewport scrollen, muss die Flex-Kette stimmen:
```
.app__box (flex column, height: calc(100vh - 112px))
  → MuiTabPanel-root (flex: 1, overflow: hidden)
    → .navigation__container / .action__container (flex: 1, overflow-y: auto)
```
Ohne `flex: 1; min-height: 0` auf dem TabPanel schiebt der Inhalt über den Viewport hinaus.

### Testing

Tests live in `test/test/` mirroring `src/` structure. Fixtures (JSON/TS) are in `test/fixtures/`. The test runner is Mocha with `ts-node` and `tsconfig-paths` for alias resolution. Config: `test/mocharc.custom.json`.

**Kein React/DOM Test-Setup vorhanden.** Frontend-Logik, die getestet werden soll, muss als reine TypeScript-Funktion (ohne React-Imports) in `admin/src/lib/` extrahiert werden. Diese Funktionen sind dann über den `@/lib/...`-Alias in Mocha-Tests importierbar.

Coverage uses `nyc` configured in `package.json` to instrument `src/**/*.ts` only.

### Multiple Telegram Instances

The adapter supports multiple simultaneous Telegram instances (`config.instanceList`). Each instance has its own state IDs (constructed via `getIds` in `configVariables.ts`). All message sending passes the active `instance` string through the call chain.

### Build Output

- Backend compiles to `build/` (entry: `build/main.js`)
- Frontend builds to `admin/build/`
- `tsc-alias` post-processes the compiled JS to rewrite path aliases to relative paths

## Known Architecture Pitfalls

### `handleSetState` — zwei Bestätigungs-Pfade (confirm)

`src/app/setstate.ts` → `handleSetState()` hat zwei Mechanismen, die eine Bestätigung an Telegram schicken können:

1. **Sofort-Send** via `exchangeValueAndSendToTelegram()` am Ende der Funktion — wird ausgeführt wenn `confirm=true`
2. **Listener-Pfad** via `addSetStateIds()` → registriert die State-ID in `setStateIdsToListenTo` → `main.ts` sendet in `stateChange` wenn `!isFalsy(confirm) && state.ack`

**Regel**: Diese beiden Pfade schließen sich gegenseitig aus. Bei `confirm=true` und `!useForeignId` darf **nur** `exchangeValueAndSendToTelegram` senden — `addSetStateIds` muss in diesem Fall übersprungen werden (sonst doppelter Send).

Korrekte Bedingung in `setstate.ts`:
```ts
if (!useForeignId && !confirm) {
    await addSetStateIds(adapter, { ... });
} else if (useForeignId) {
    // foreignId-Pfad: nur addSetStateIds, kein exchangeValueAndSendToTelegram
}
// confirm=true && !useForeignId: nur exchangeValueAndSendToTelegram am Ende
```

### `setStateIdsToListenTo` — modul-globales Array

`src/app/setStateIdsToListenTo.ts` hält ein modul-globales Array. Einträge werden nur entfernt wenn `main.ts` `stateChange` feuert und die Bedingung (`!isFalsy(confirm) && state.ack`) zutrifft. Bei `confirm=false` landet ein Eintrag in der Liste, wird aber nie verarbeitet und nie entfernt — potenzielle Memory-Leak-Quelle.

### `isTruthy` / `isFalsy` — nicht komplementär

`src/lib/utils.ts`: `isTruthy` und `isFalsy` sind **keine** Umkehrungen voneinander. Beide geben für `undefined` / `null` jeweils `false` bzw. `true` zurück, aber für andere Werte können beide `false` sein (z.B. für den String `'2'`). Nie `!isTruthy(x)` als Ersatz für `isFalsy(x)` verwenden.

### Tests — `setStateIdsToListenTo` ist zustandsbehaftet über Tests hinweg

Das modul-globale Array aus `setStateIdsToListenTo.ts` wird zwischen Tests nicht zurückgesetzt. Tests, die dieses Array prüfen, müssen eindeutige State-IDs verwenden, um Kollisionen mit anderen Tests zu vermeiden. Beim Prüfen auf Abwesenheit einer ID immer `listAfter.some(el => el.id === testId)` verwenden, nicht auf die Array-Länge allein verlassen.

### `AppContentTabSettings.componentDidMount` — Defaultwert nur bei `undefined`, nicht bei `false`

`admin/src/pages/AppContentTabSettings.tsx`: Checkboxen, die beim ersten Laden auf einen Defaultwert gesetzt werden sollen, müssen mit `!isDefined(value)` geprüft werden — **nicht** mit `!value`. `!value` würde ein bewusst gesetztes `false` ebenfalls überschreiben, weil `!false === true`. Dies führte dazu, dass die Checkbox "Menü nach Neustart senden" nie auf `false` gespeichert werden konnte — jedes Öffnen der Settings-Seite hat sie zurückgesetzt.

```ts
// Falsch — überschreibt gespeichertes false beim nächsten Öffnen der Settings:
if (!value) { ... }

// Richtig — initialisiert nur wenn noch kein Wert vorhanden (undefined/null):
if (!isDefined(value)) { ... }
```

Die Bedingung ist als testbare reine Funktion in `admin/src/lib/settings.ts` → `shouldDefaultSendMenuAfterRestart()` extrahiert und in `test/test/AppContentTabSettings.test.ts` getestet.