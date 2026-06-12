# TODO — nächste Optimierungsfelder

Coverage-Baseline: 89.19% stmts / 85.88% branch / 89.33% funcs

<!-- Coverage nach Test-Erweiterung (2026-06-12, 711 Tests grün):
     91.64% stmts / 90.68% branch / 92.59% funcs / 91.22% lines (alle Dateien inkl. main.ts)
     src/app: 98.43% stmts / 95.3% branch — src/lib: 100% überall.
     Verbleibende Lücken: main.ts (nicht unit-testbar), action.ts 108-134,
     httpRequest.ts 62, events.ts 101, jsonTable.ts (akzeptiert, s.u.), telegram.ts 10 (akzeptiert). -->

---

## Priorität 1 — Größte Coverage-Lücken

### 1. [x] `idBySelector.ts` — 64% stmts, 23% branch, 50% funcs (Zeilen 43–84)

Zwei Hilfsfunktionen sind komplett ungetestet:

- [x] `getCommonName` (Zeile 68–79) — drei Branches: kein Name → `''`, `typeof name === 'string'`, und Objekt mit Sprach-Key
- [x] `removeLastPartOfId` (Zeile 81–85) — splittet eine ioBroker-ID und entfernt das letzte Segment

Im Hauptpfad fehlen außerdem:
- [x] `{common.name}`-Pfad (Zeile 42–45) — `getForeignObjectAsync` wird aufgerufen und Name eingesetzt
- [x] `{folder.name}`-Pfad (Zeile 46–49) — ruft Elternobjekt über `removeLastPartOfId` ab

**Erledigt:** Tests in `test/test/app/idBySelector.test.ts` (indirekt über `idBySelector`, Funktionen bleiben privat).
Das finale `return ''` in `getCommonName` ist durch `?? 'en'` strukturell unerreichbar → `/* istanbul ignore */` im Code.

---

### 2. [x] `sendpic.ts` — 72% stmts, 33% funcs (Zeilen 36, 50–62, 68)

- [x] Zeile 36: `sendToTelegram`-Aufruf im `delay <= 0`-Pfad (Callback von `loadWithCurl` manuell ausgeführt)
- [x] Zeilen 50–62: `setTimeout`-Callback (über `adapter.setTimeout.firstCall.args[0]()` ausgeführt, `clearTimeout` geprüft)
- [x] Zeile 68: `timeouts.push`-Branch (`setTimeout` liefert Handle → Eintrag `{ key: 'key0', timeout: 42 }` in Rückgabe)

**Erledigt:** `test/test/app/sendpic.test.ts` — jetzt 100% stmts/branch/funcs.

---

### 3. [x] `getstate.ts` — 86% stmts, 74% branch (Zeilen 63–94)

- [x] Zeilen 63–75: `config.json.textTable`-Pfad — Ergebnis → `sendToTelegram` mit `parse_mode:false`, `shouldCleanUpString:false`; `result` falsy → nur `log.debug('Cannot create a Text-Table')`
- [x] Zeilen 78–94: `alexaShoppingList`-Pfad mit **leerem** `stateValue` → sendet `'The state is empty!'`
- [x] Bonus: Zeile 22 (`getData || []`), Zeile 50 (`state.val ?? ''`), Zeile 102 (`'No Change'`-Branch)

**Erledigt:** `test/test/app/getstate.test.ts` — jetzt 100% überall.

---

## Priorität 2 — Mittlere Coverage-Lücken

### 4. [x] `echarts.ts` — 87% stmts, 67% branch, 50% funcs (Zeilen 30–32)

**Erledigt:** Getestet statt ignoriert — `sendTo`-Callback über `callsFake` aufgerufen, beide Branches
(`result.error` truthy → Error-String; falsy → Dateipfad) in `test/test/app/echarts.test.ts`. Jetzt 100%.

---

### 5. [x] `processData.ts` — 97% stmts, 91% branch (Zeilen 200–209)

**Erledigt:** Beide Kombinationen in `test/test/app/processData.test.ts`:
- `switchBack`-Result vorhanden + `watchForId` leer → `sendToTelegram` mit Back-Keyboard (Zeilen 200–209)
- Result vorhanden + `watchForId` gesetzt → `sendNav` (Zeile 212), kein Back-Send
- Bonus: Zeile 165 — `valueType` undefined → `navToGoTo` direkt verwendet. Jetzt 100%.

---

### 6. [x] `subMenu.ts` — 100% stmts, 95% branch (Zeilen 128, 141, 203)

- [x] Zeile 128: negativer zweiter Wert via `(-)` (`menu:number5-(-)5-1-°C`) + aufsteigender Bereich (`1-20-2-°C`, Button-Reihenfolge aufsteigend geprüft)
- [x] Zeile 141: negativer Step → **strukturell unerreichbar/unbrauchbar** (`replace('(-)',...)` ersetzt nur das erste Vorkommen; negativer Step würde Endlosschleife `i -= step` bei `start >= end` erzeugen) → `/* istanbul ignore */` im Code
- [x] Zeile 203: `switchBack`-Result ohne `textToSend` → Default `''` gesendet; Result `undefined` → kein Send (war bereits getestet)

**Erledigt:** `test/test/app/subMenu.test.ts` — jetzt 100%.

---

## Priorität 3 — Kleine Einzelbranches (Quick Wins)

| Datei | Zeile | Was fehlt | Status |
|---|---|---|---|
| `connection.ts` | 20 | Branch bei fehlgeschlagenem Verbindungsaufbau | [x] Test: `val: null` → `?? false`-Fallback, `setState('info.connection', false, true)` |
| `appContext.ts` | 27–34 | Initialisierungs-Branch (Defaultwert-Pfad) | [x] Test: `instanceList`/`usersInGroup` undefined → `[]`-Defaults |
| `setStateListenerHandler.ts` | 118 | Branch in `exchangeValue`-Fehlerfall | [x] Test: `returnText: undefined` + `state.val: null` → `??`/`?.`-Branches, leerer Text gesendet |
| `shoppingListManager.ts` | 51 | Pfad wenn `getForeignObjectAsync` kein Ergebnis liefert | [x] Test: `getLast` gestubbt → `'Cannot delete the Item'` an bekannte Instanz |
| `dynamicSwitchMenu.ts` | 15 | Fehler-Branch im dynSwitch-Parsing | [x] Test: `textModifier` gestubbt auf `undefined` → Guard greift (Test statt ignore: dokumentiert das Guard-Verhalten) |
| `appUtils.ts` | 99 | Branch in `mathFunction` | [x] War tatsächlich `statusIdAndParams` (`splitArray[1] ?? ''`): Test mit Eingabe ohne `:` (nur ID) |
| `utilities.ts` | 73 | Branch in `transformValueToTypeOfId` | [x] War der `{set:...}`-Pfad in `textModifier` ohne Wert → kein `setstateIobroker`-Aufruf (Test, da realer User-Input) |
| `string.ts` | 18 | Branch in `parseJSON` bei `val = null` | [x] `val ?? ''` im `catch` ist strukturell unerreichbar (JSON.parse läuft nur bei truthy `val`) → `/* istanbul ignore */` im Code; `parseJSON(null)` war bereits getestet |

---

## Strukturell unerreichbar (akzeptiert, kein Test nötig)

- `action.ts` Zeile 121: `elIndex ? elIndex : index` — `elIndex` ist in `config.ts` immer `0` oder `undefined` (beides falsy)
- `telegram.ts` Zeile 10: `isEmptyString(textToSend ?? '')` — durch vorherige `!textToSend`-Prüfung nie erreichbar
- `jsonTable.ts` Zeilen 131, 153–171, 223, 232: `resetId()`, `getRequestIds()`, `addRequestId()` — nie direkt aufgerufen
- `setstate.ts` Zeile 50: `error`-Branch in `resolveIdExpression` — durch vorherige Pfade nie erreichbar
- `setstate.ts` Zeile 204–205: `state ? state.val : valueToTelegram` — `state` ist nach `getForeignStateAsync` immer defined
- `main.ts` — Adapter-Einstiegspunkt, nicht unit-testbar
- `subMenu.ts` Zeile ~141: negativer Step in `createSubmenuNumber` — `(-)`-Replacement greift nur für den ersten Wert; negativer Step würde Endlosschleife erzeugen (`/* istanbul ignore */` gesetzt)
- `string.ts` Zeile ~18: `val ?? ''` im `catch` von `parseJSON` — `val` ist im `catch` immer truthy (`/* istanbul ignore */` gesetzt)
- `idBySelector.ts` `getCommonName`: finales `return ''` — `language` ist durch `?? 'en'` nie falsy (`/* istanbul ignore */` gesetzt)
