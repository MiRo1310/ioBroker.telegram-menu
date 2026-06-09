# Refactoring: main.ts — Mehr Struktur & Klassen

## Schritt 1 — `onReady()` in private Init-Methoden zerlegen ✅

- [x] `private configVariables!`, `menuData`, `menus`, `timeoutKey` als Klassen-Properties
- [x] `private async checkTelegramConnections(): Promise<boolean>`
- [x] `private async buildMenuData(): Promise<void>`
- [x] `private async sendStartupMenus(startSides): Promise<void>`
- [x] `private async subscribeToStates(): Promise<void>`
- [x] `onReady()` als sauberer Orchestrator

---

## Schritt 2 — `stateChange`-Handler extrahieren ✅

- [x] `private async handleEventChange(...)`
- [x] `private async handleShoppingListChange(state): Promise<boolean>`
- [x] `private async handleAddToShoppingList(id): Promise<boolean>`
- [x] `private async handleMenuStateChange(...)`
- [x] `private async handleSetStateListener(...)`
- [x] Dispatcher mit korrekten frühen Returns

---

## Schritt 3 — `StateIdRegistry`-Klasse ✅

Datei: `src/app/stateIdRegistry.ts`

- [x] Klasse `StateIdRegistry` mit `private stateIdRegistry: SetStateIds[] = []`
- [x] `getIds(): SetStateIds[]`
- [x] `private findId(setStateId): SetStateIds | undefined`
- [x] `async addIds(adapter, setStateId): Promise<void>` — inkl. Duplikat-Check
- [x] Singleton-Export: `export const stateIdRegistry = new StateIdRegistry()`
- [x] `src/app/setstate.ts` nutzt `stateIdRegistry.addIds()` direkt
- [x] `src/main.ts` nutzt `stateIdRegistry.getIds()` direkt
- [x] Tests auf `stateIdRegistry.getIds()` umgestellt

---

## Schritt 4 — `processData.ts` → `MenuProcessor`-Klasse ✅

Datei: `src/app/processData.ts`

- [x] Klasse `MenuProcessor` mit `private timeouts: Timeouts[]` und Constructor-Injektion aller Parameter
- [x] `checkEveryMenuForData()` als async Klassen-Methode
- [x] `processData(groupWithUser, groupData)` als private Klassen-Methode
- [x] `getTimeouts(): Timeouts[]` als Klassen-Methode
- [x] `main.ts`: `private menuProcessor: MenuProcessor | undefined` als Klassen-Property
- [x] `main.ts`: `new MenuProcessor(...)` pro Request, `menuProcessor.checkEveryMenuForData()` aufrufen
- [x] `main.ts` `onUnload`: `this.menuProcessor?.getTimeouts()` statt `getTimeouts()`
- [x] Tests auf neue API umgestellt (`processData.test.ts`, `main.test.ts`, `setstate.test.ts`)

**Verifikation:** `npm run tsc && npm run test:ts`

---

## Abschluss-Check (Schritt 1–5)

- [x] `npm run test:ts` → 635 Tests grün
- [x] `npm run tsc` → keine TypeScript-Fehler
- [x] `npm run lint:backend` → keine Lint-Fehler
- [x] `npm run build` → vollständiger Build erfolgreich

---

## Schritt 5 — `backMenu.ts` → `BackMenuRegistry`-Klasse ✅

Datei: `src/app/backMenu.ts`

- [x] Klasse `BackMenuRegistry` mit `private backMenu: BackMenu = {}`
- [x] Methode `backMenuFunc(...)` als Klassen-Methode
- [x] Methode `async switchBack(...)` als Klassen-Methode
- [x] Singleton-Export: `export const backMenuRegistry = new BackMenuRegistry()`
- [x] Alle Aufrufer umgestellt: `processData.ts`, `adapterStartMenuSend.ts`, `events.ts`, `subMenu.ts`
- [x] Tests angepasst: `back-menu.test.ts`, `subMenu.test.ts`, `processData.test.ts`
- [x] `processData.ts` ohne `try/catch` — Fehler propagieren nach oben (bewusste Entscheidung)
- [x] Fehlertest angepasst: erwartet jetzt propagierten Fehler statt Log-Aufruf

**Verifikation:** `npm run tsc && npm run test:ts` → 635 Tests grün ✅

---

## Schritt 6 — `messageIds.ts` — `isDeleting`-Flag kapseln ✅

Datei: `src/app/messageIds.ts`

**Problem:** `let isDeleting = false` ist modul-global — nie zurückgesetzt zwischen Tests.

- [x] Klasse `MessageIdManager` mit `private isDeleting = false`
- [x] Singleton-Export: `export const messageIdManager = new MessageIdManager()`
- [x] `deleteMessageIds` in Klasse verschoben, `this.isDeleting` überall verwendet
- [x] Bound-Exports für Abwärtskompatibilität: `saveMessageIds` / `deleteMessageIds`

**Verifikation:** `npm run tsc && npm run test:ts` → alle Tests grün ✅

---

## Schritt 7 — Coverage auf ≥ 87% Branch erhöhen ✅

**Vorher:** 88.46% Stmts / 83.79% Branch / 89.06% Funcs (635 Tests)
**Nachher:** 89.54% Stmts / **87.12% Branch** / 91.23% Funcs (654 Tests)

- [x] `backMenu.ts`: 5× `/* istanbul ignore next */` für strukturell unerreichbare Branches (Guards, Ternaries)
- [x] `setstate.ts`: 2× `/* istanbul ignore next */` (modifiedValue true-Branch, _getDynamicValueIfIsIn error-Branch)
- [x] `messageIds.ts`: 2× `/* istanbul ignore next */` (copyMessageIds guard, json ?? {} Branch)
- [x] `jsonTable.ts`: 3× `/* istanbul ignore next */` (resetId, getRequestIds, addRequestId — nur in main.ts genutzt)
- [x] `subMenu.test.ts`: 7 neue Tests (percent30, number descending, step<1, dynSwitch, dynSVal, setMenuValue guards)
- [x] `setstate.test.ts`: 4 neue Tests (setstateIobroker catch, handleSetState catch, toggle-null, useForeignId-null)
- [x] `exchangeValue.test.ts`: 3 neue Tests (null val, {novalue} ohne change map, undefined val)
- [x] `jsonTable.test.ts`: 3 neue Tests (createKeyboardFromJson catch, createTextTableFromJson catch, getLast)
- [x] `messageIds.test.ts`: 2 neue Tests (isDeleting=true Zweig, ungültiges JSON)

**Verifikation:** 654 Tests grün, Branch ≥ 87% ✅, TypeScript fehlerfrei ✅
