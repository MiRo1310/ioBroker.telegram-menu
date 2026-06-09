# Refactoring: main.ts — Mehr Struktur & Klassen

## Schritt 1 — `onReady()` in private Init-Methoden zerlegen

Neue Klassen-Felder in `TelegramMenu`:
- [x] `private config!: ReturnType<typeof getConfigVariables>` als Klassen-Property statt lokale Variable
- [x] `private menuData: MenuData = {}` als Klassen-Property statt lokale Variable

Neue private Methoden (Zeilen aus `onReady()` extrahieren):
- [x] `private async checkTelegramConnections(): Promise<boolean>` — Zeilen 331–337 (bereits extrahiert)
- [x] `private async buildMenuData(): Promise<void>` — Zeilen 65–115 (Config laden, MenuData aufbauen, generateActions inkl. Event-Subscriptions)
- [x] `private async sendStartupMenus(): Promise<void>` — Zeilen 120–129 (sendMenuAfterRestart)
- [x] `private subscribeToStates(): void` — Zeilen 317–328 (Telegram-States subscriben)
- [ ] `onReady()` nur noch als Orchestrator (~30 Zeilen): ruft die 5 Methoden der Reihe nach auf

**Verifikation:** `npm run tsc && npm run test:js`

---

## Schritt 2 — `stateChange`-Listener aus `onReady()` extrahieren

- [ ] Neue Methode `private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void>` anlegen
- [ ] In `subscribeToStates()` (aus Schritt 1) statt anonymem Callback `this.onStateChange.bind(this)` verwenden
- [ ] `onStateChange` als klaren Dispatcher aufbauen (frühes Return statt tief genestetes if/else):
  - [ ] `private async handleEventChange(...)` — Event-Pfad (Zeilen 140–152)
  - [ ] `private async handleShoppingListChange(...)` — `sList:`-Pfad (Zeilen 158–167)
  - [ ] `private async handleAddToShoppingList(...)` — `isAddToShoppingList`-Pfad (Zeilen 169–185)
  - [ ] `private async handleMenuStateChange(...)` — instance-Pfad (Zeilen 187–230)
  - [ ] `private async handleSetStateListeners(...)` — `setStateIdsToListenTo`-Pfad (Zeilen 232–311)

**Verifikation:** `npm run tsc && npm run test:js`

---

## Schritt 3 — `setStateIdsToListenTo.ts` → `StateIdRegistry`-Klasse

Datei: `src/app/setStateIdsToListenTo.ts`

- [ ] Klasse `StateIdRegistry` anlegen mit `private ids: SetStateIds[] = []`
- [ ] Methode `getAll(): SetStateIds[]`
- [ ] Methode `find(setStateId: SetStateIds): SetStateIds | undefined`
- [ ] Methode `async add(adapter: Adapter, setStateId: SetStateIds): Promise<void>`
- [ ] Singleton-Export: `export const stateIdRegistry = new StateIdRegistry()`
- [ ] Kompatibilitäts-Exports beibehalten (keine Änderungen in aufrufenden Dateien nötig):
  - [ ] `export const getStateIdsToListenTo = () => stateIdRegistry.getAll()`
  - [ ] `export const getFind = (id) => stateIdRegistry.find(id)`
  - [ ] `export const addSetStateIds = (adapter, id) => stateIdRegistry.add(adapter, id)`

**Verifikation:** `npm run tsc && npm run test:js`

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

**Verifikation:** `npm run tsc && npm run test:js`

---

## Abschluss-Check

- [ ] `npm run test:js` → alle 599 Tests grün
- [ ] `npm run tsc` → keine TypeScript-Fehler
- [ ] `npm run lint:backend` → keine Lint-Fehler
- [ ] `npm run build` → vollständiger Build erfolgreich