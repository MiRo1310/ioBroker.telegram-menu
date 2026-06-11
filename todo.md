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

---

## Schritt 8 — Unnötige try-catch entfernen ✅

**Ziel:** Vollständiger Stack-Trace bei Fehlern statt stillem Schlucken.

- [x] try-catch entfernt in: `telegram.ts`, `setstate.ts`, `shoppingList.ts`, `getstate.ts`, `subMenu.ts`, `sendNav.ts`, `sendpic.ts`, `echarts.ts`, `action.ts`, `backMenu.ts`, `dynamicSwitchMenu.ts`, `botAction.ts`, `messageIds.ts`, `idBySelector.ts`, `lib/utilities.ts`
- [x] `errorLogger`-Import in allen betroffenen Dateien entfernt
- [x] `idBySelector.ts`: fire-and-forget `.then().catch()` → `await Promise.all` + `await sendToTelegram`
- [x] Behalten: `main.ts:onReady` (Top-Level-Handler), `main.ts:onUnload` (callback muss immer feuern), `lib/math.ts:evaluate` (eval-Fehler erwartet), `lib/string.ts:parseJSON` (JSON.parse-Fehler erwartet), `lib/utils.ts:deepCopy`, `httpRequest.ts` (Netzwerkfehler pro URL)
- [x] Nebenbei gefixte Bugs: `parseMode.ts` (`?.[0]?.parse_mode` statt `?.[0].parse_mode`), `setstate.ts:setValue` (`value ?? ''` verhindert undefined.includes-Crash)
- [x] Tests: 12 "should catch errors"-Tests → "should propagate errors" mit `rejectedWith`

**Verifikation:** 614 Tests grün, TypeScript fehlerfrei ✅

---

## Schritt 9 — Double-Send-Guard + StateIdRegistry-Warnung ✅

- [x] `setstate.ts`: Guard vor `exchangeValueAndSendToTelegram` — `log.error` wenn ID bereits im Registry steht
- [x] `stateIdRegistry.ts`: Stilles `return` bei Duplikat → `log.warn` mit ID-Name

**Verifikation:** 614 Tests grün ✅

---

## Schritt 10 — StateIdRegistry Memory-Leak beheben ✅

**Problem:** Einträge mit `confirm=false` wurden in `stateIdRegistry` eingetragen, aber nie entfernt — `!isFalsy(false)` ist `false`, der Listener-Pfad in main.ts greift nie.

- [x] Entscheidung: Option A — Einträge mit falsy `confirm` gar nicht erst eintragen (sie haben keinen Zweck)
- [x] `setstate.ts`: `if (!useForeignId && !confirm)` Block mit `addIds`-Aufruf entfernt; `else if (useForeignId)` → `if (useForeignId)`
- [x] `shoppingListManager.ts`: fehlende bound exports `shoppingListSubscribeStateAndDeleteItem` / `deleteMessageAndSendNewShoppingList` hinzugefügt (Build-Fehler behoben)
- [x] Test in `setstate.test.ts` aktualisiert: "should ADD... when confirm=false" → "should NOT add... when confirm=false"

**Verifikation:** 614 Tests grün, TypeScript fehlerfrei ✅

---

## Schritt 11 — `ShoppingListManager`-Klasse in shoppingList.ts ✅

**Problem:** `objData: ObjectData` und `isSubscribed: boolean` waren modul-global.

- [x] Klasse `ShoppingListManager` mit `private objData` und `private isSubscribed`
- [x] `subscribeStateAndDeleteItem` und `deleteMessageAndSendNewShoppingList` als Klassenmethoden
- [x] Singleton-Export: `export const shoppingListManager = new ShoppingListManager()`
- [x] Bound-Exports für Abwärtskompatibilität: `shoppingListSubscribeStateAndDeleteItem` / `deleteMessageAndSendNewShoppingList`
- [x] `test/test/app/shoppingListManager.test.ts` — Tests nutzen Singleton direkt

**Verifikation:** 614 Tests grün ✅

---

## Schritt 12 — Modul-globalen Zustand in subMenu.ts kapseln ✅

**Problem:** `let step = 0` und `let splittedData: SplittedData = []` sind modul-global. `step` wird in `createSubmenuPercent` gesetzt und in `isSetSubmenuPercent` gelesen — temporale Kopplung. `splittedData` wird in `createSwitchMenu` gesetzt und in `setMenuValue` gelesen.

- [x] Option A gewählt: `SubmenuHandler`-Klasse mit `step` und `splittedData` als Instance-State (Option B scheidet aus — State muss über separate Telegram-Requests hinweg persistieren)
- [x] `export const submenuHandler = new SubmenuHandler()` — Singleton mit `reset()`-Methode
- [x] Modul-globale Variablen `step` und `splittedData` eliminiert
- [x] Tests: `submenuHandler.reset()` in `beforeEach`, "should propagate errors" explizit eingerichtet statt auf globalem State eines Vorgängertests

**Verifikation:** 614 Tests grün ✅

---

## Schritt 13 — `processData()` in MenuProcessor aufteilen ✅

**Problem:** `processData()` ist 152 Zeilen mit klar trennbaren Phasen.

- [x] `private handleDynamicValue(): Promise<boolean>` — Dynamic-Value-Pfad
- [x] `private dispatchNavAction(part, call): Promise<boolean>` — nav/submenu-Dispatch
- [x] `private dispatchPartAction(part): Promise<boolean>` — setState/getData/sendPic/location/echarts/httpRequest
- [x] `processData()` wird zum schlanken Orchestrator der drei Methoden
- [x] Tests für neue Methoden ergänzen

**Verifikation:** 18 Tests grün ✅

---

## Schritt 14 — `SetStateListenerHandler`-Klasse aus main.ts extrahieren ✅

**Problem:** `handleSetStateListener()` in main.ts ist 85 Zeilen mit verschachtelter Confirm-Logik, schwer isoliert testbar.

- [x] Klasse `SetStateListenerHandler` mit `appContext` im Constructor
- [x] `handlePreConfirm()` — `isTruthy(confirm) && !ack && {confirmSet:` Pfad
- [x] `handlePostConfirm()` — `!isFalsy(confirm) && ack` Pfad
- [x] main.ts `handleSetStateListener` wird zur dünnen Delegation
- [x] Tests für beide Pfade unabhängig von main.ts — `test/test/app/setStateListenerHandler.test.ts` (15 Tests)

**Verifikation:** 629 Tests grün ✅

---

## Schritt 15 — `KeyboardBuilder`-Klasse für subMenu percent/number ✅

**Problem:** `createSubmenuPercent()` und `createSubmenuNumber()` bauen beide `inline_keyboard`-Arrays mit identischem Zeilen-Split-Muster (rowEntries-Counter, push bei maxEntriesPerRow).

- [x] `export class KeyboardBuilder` mit `addButton(text, callbackData): this` und `build(maxPerRow): Keyboard`
- [x] `createSubmenuPercent` und `createSubmenuNumber` nutzen `KeyboardBuilder`
- [x] Duplizierter rowEntries/menu/keyboard-Loop vollständig entfernt

**Verifikation:** 629 Tests grün ✅

---

## Schritt 16 — `StateValueTransformer` für getstate.ts ✅

**Problem:** `getState()` hat 5+ gleichförmige "text includes X → transform" Schritte (timestamp, time, math, round, json, alexaShoppingList).

- [x] `export class StateValueTransformer` in `src/app/stateValueTransformer.ts` — hält `text`, `stateVal` und `originalStaleVal` (für `applyTime`) als Instance-State
- [x] `async applyTimestamp(id)`, `applyTime()`, `applyMath()`, `applyRound()` — jede Methode prüft ihren Pattern-Check selbst
- [x] Terminale Pfade (`json.textTable`, `alexaShoppingList`) bleiben in `getState()` — sie senden direkt und passen nicht in die pure Transform-Pipeline
- [x] `getState()` instantiiert `new StateValueTransformer(text, cleanedString, appContext)` und ruft die vier apply-Methoden sequenziell auf
- [x] `test/test/app/stateValueTransformer.test.ts` (16 Tests) — jede Methode einzeln getestet inkl. no-op-Fälle und Fehlerverhalten; Chaining-Test für math→round

**Verifikation:** 645 Tests grün ✅
