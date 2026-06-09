# Refactoring: main.ts — Mehr Struktur & Klassen

## Schritt 1 — `onReady()` in private Init-Methoden zerlegen ✅

- [x] `private configVariables!: ReturnType<typeof getConfigVariables>` — Zeile 45
- [x] `private menuData: MenuData = {}` — Zeile 44
- [x] `private menus: string[] = []` — Zeile 47
- [x] `private timeoutKey = '0'` — Zeile 46
- [x] `private async checkTelegramConnections(): Promise<boolean>`
- [x] `private async buildMenuData(): Promise<void>`
- [x] `private async sendStartupMenus(startSides): Promise<void>`
- [x] `private async subscribeToStates(): Promise<void>`
- [x] `onReady()` als sauberer Orchestrator — Zeilen 62–109

---

## Schritt 2 — `stateChange`-Handler extrahieren ✅

- [x] `private async handleEventChange(...)` — Zeilen 111–131
- [x] `private async handleShoppingListChange(state): Promise<boolean>` — Zeilen 133–145
- [x] `private async handleAddToShoppingList(id): Promise<boolean>` — Zeilen 147–165
- [x] `private async handleMenuStateChange(...)` — ab Zeile 167
- [x] `private async handleSetStateListener(...)` — ab Zeile ~210
- [x] Dispatcher mit korrekten frühen Returns (`if (await ...) return`) — Zeilen 94–100

---

## Schritt 3 — `StateIdRegistry`-Klasse ⚠️ fast fertig

Datei: `src/app/stateIdRegistry.ts`

- [x] Klasse `StateIdRegistry` mit `private stateIdRegistry: SetStateIds[] = []`
- [x] `getIds(): SetStateIds[]`
- [x] `private getFind(setStateId): SetStateIds | undefined`
- [x] `async addSetStateIds(adapter, setStateId): Promise<void>` — inkl. Duplikat-Check
- [x] Singleton-Export: `export const stateIdRegistry = new StateIdRegistry()`
- [x] `src/app/setstate.ts` nutzt `stateIdRegistry.addSetStateIds()` direkt
- [x] `src/main.ts` nutzt `stateIdRegistry.getIds()` direkt
- [ ] **Tests brechen** — `test/test/setstate.test.ts` importiert `getStateIdsToListenTo` aus `stateIdRegistry.ts`, diese Funktion existiert nicht
  - Option A: Kompatibilitäts-Export ergänzen: `export const getStateIdsToListenTo = () => stateIdRegistry.getIds()`
  - Option B: Tests auf `stateIdRegistry.getIds()` umstellen

**Verifikation:** `npm run tsc && npm run test:ts`

---

## Schritt 4 — `processData.ts` → `MenuProcessor`-Klasse

Datei: `src/app/processData.ts`

- [ ] Klasse `MenuProcessor` anlegen mit `private timeouts: Timeouts[] = []`
- [ ] `checkEveryMenuForData` als Klassen-Methode
- [ ] `processData` als private Klassen-Methode
- [ ] `getTimeouts(): Timeouts[]` als Klassen-Methode
- [ ] Singleton-Export: `export const menuProcessor = new MenuProcessor()`
- [ ] Kompatibilitäts-Exports beibehalten:
  - [ ] `export const checkEveryMenuForData = (p) => menuProcessor.checkEveryMenuForData(p)`
  - [ ] `export const getTimeouts = () => menuProcessor.getTimeouts()`

**Verifikation:** `npm run tsc && npm run test:ts`

---

## Abschluss-Check

- [ ] `npm run test:ts` → alle Tests grün
- [ ] `npm run tsc` → keine TypeScript-Fehler
- [ ] `npm run lint:backend` → keine Lint-Fehler
- [ ] `npm run build` → vollständiger Build erfolgreich
