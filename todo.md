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

## Abschluss-Check

- [ ] `npm run test:ts` → alle Tests grün
- [ ] `npm run tsc` → keine TypeScript-Fehler
- [ ] `npm run lint:backend` → keine Lint-Fehler
- [ ] `npm run build` → vollständiger Build erfolgreich
